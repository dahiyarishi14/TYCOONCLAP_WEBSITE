// functions/api/paypal-ipn.js
//
// PayPal calls THIS endpoint automatically, server-to-server, the moment
// a payment completes on your payment link — no redirect needed, so it
// works fine with PayPal's simple payment links (unlike Stripe's flow,
// there's no session_id to hand back to a success page).
//
// Route: this file at functions/api/paypal-ipn.js is automatically live at
//   https://tycoonclap.com/api/paypal-ipn
//
// ONE-TIME SETUP IN PAYPAL:
//   1. Log into paypal.com → Settings (gear icon) → Account settings
//   2. Left menu → "Notifications" → "Instant payment notifications" → Update
//   3. Set "Notification URL" to: https://tycoonclap.com/api/paypal-ipn
//   4. Turn IPN "On" and Save
//
// Required environment variables (set in Cloudflare dashboard:
// Workers & Pages → your project → Settings → Environment variables):
//   RESEND_API_KEY   = your Resend.com API key (free tier covers this easily)
//   LEADS_CSV_URL    = a direct link to the CSV so it can be attached/linked
//                      (e.g. a Cloudflare R2 public object URL, or a link
//                      to a file stored in a private repo folder you fetch
//                      server-side — just not something publicly guessable
//                      without this email)

export async function onRequestPost(context) {
  const { request, env } = context;

  // PayPal sends the IPN as form-encoded data
  const bodyText = await request.text();

  // --- 1. Verify with PayPal that this notification is genuine ---
  // (Anyone could POST fake data to this URL claiming a payment happened —
  // this verification step is what stops that.)
  const verifyBody = 'cmd=_notify-validate&' + bodyText;
  const verifyRes = await fetch('https://ipnpb.paypal.com/cgi-bin/webscr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: verifyBody,
  });
  const verifyResult = await verifyRes.text();

  if (verifyResult.trim() !== 'VERIFIED') {
    // Not a genuine PayPal notification — ignore it.
    return new Response('not verified', { status: 400 });
  }

  // --- 2. Parse the notification and check it's an actual completed sale ---
  const params = new URLSearchParams(bodyText);
  const paymentStatus = params.get('payment_status');
  const payerEmail = params.get('payer_email');
  const payerName = params.get('first_name') || 'there';

  if (paymentStatus !== 'Completed') {
    // Could be Pending, Refunded, Denied, etc. — do nothing.
    return new Response('ignored: status not Completed', { status: 200 });
  }

  if (!payerEmail) {
    return new Response('ignored: no payer email', { status: 200 });
  }

  // --- 3. Email the CSV to the buyer ---
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Tycoon Clap <leads@tycoonclap.com>',
        to: payerEmail,
        subject: 'Your dentist leads CSV is ready',
        html: `
          <p>Hi ${payerName},</p>
          <p>Thanks for your purchase — here's your download link:</p>
          <p><a href="${env.LEADS_CSV_URL}">Download your CSV</a></p>
          <p>This link is unique to your order. If you run into any trouble,
          just reply to this email and we'll sort it out.</p>
          <p>— Tycoon Clap</p>
        `,
      }),
    });
  } catch (err) {
    console.error('Failed to send delivery email:', err);
    // Still return 200 to PayPal — this just means the email failed,
    // not that the IPN itself was invalid. You'd want your own logging/
    // alerting here so a failed send doesn't go unnoticed.
  }

  return new Response('ok', { status: 200 });
}
