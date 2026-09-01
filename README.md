# Tycoon Clap — Leads Sales Page

You're on **Cloudflare Pages** with the site's files in GitHub, so Cloudflare
auto-builds and deploys every time you push to your connected branch —
there's no separate "upload to server" step.

Files, and where they go **inside your existing repo**:

```
your-repo/
├── index.html            (already exists)
├── style.css             (already exists)
├── leads.html            ← add this, same folder as index.html
├── leads.css             ← add this, same folder as index.html
├── leads-success.html    ← add this, same folder as index.html
└── functions/
    └── api/
        └── verify-and-download.js   ← add this — new top-level /functions folder
```

The `functions/` folder must sit at the **repo root**, as a sibling to
`index.html` — not inside any subfolder — that's how Cloudflare Pages
auto-detects it as a serverless route.

## Git steps

```bash
# from your local clone of the repo
cd tycoon-clap-website        # or whatever your repo folder is called

# copy the downloaded files in (adjust paths to wherever you saved them)
cp ~/Downloads/leads.html .
cp ~/Downloads/leads.css .
cp ~/Downloads/leads-success.html .
mkdir -p functions/api
cp ~/Downloads/verify-and-download.js functions/api/

git add leads.html leads.css leads-success.html functions/
git commit -m "Add leads sales page with Stripe checkout + auto CSV delivery"
git push origin main       # or whatever branch Cloudflare Pages watches
```

Cloudflare Pages will pick up the push automatically and deploy within
a minute or two — check the "Deployments" tab in your Cloudflare
dashboard to watch it build. No `vercel.json`, no build config needed
for static files; Cloudflare just publishes what's in the repo.

## Current setup: PayPal Payment Link + automatic email delivery

The "Buy & Download Now" button on `leads.html` now points at your live
PayPal payment link: `https://www.paypal.com/ncp/payment/YJDMHMLDJJ78E`.
PayPal Checkout lets buyers pay with a PayPal balance **or** Visa/Mastercard/
Amex as a guest — no PayPal account required on their end.

**Important difference from Stripe:** PayPal payment links don't redirect
back to your site with an order/session ID, so the `leads-success.html`
auto-download page (built for Stripe) doesn't apply here. Instead, delivery
is automated with **PayPal IPN** (Instant Payment Notification) — PayPal
calls your server directly the moment a payment completes, and your server
emails the buyer their CSV. `functions/api/paypal-ipn.js` handles this.

### One-time setup

1. **Turn on IPN in your PayPal account:**
   - Log into paypal.com → Settings (gear icon, top right) → **Account settings**
   - Left menu → **Notifications** → "Instant payment notifications" → **Update**
   - Notification URL: `https://tycoonclap.com/api/paypal-ipn`
   - Toggle IPN **On** → Save
2. **Sign up for Resend** (resend.com — free tier covers low volume easily) to send the delivery emails, or swap in SendGrid/Mailgun if you already use one of those; the function just needs a small edit to the API call if so.
3. **Set environment variables in Cloudflare:**
   - Cloudflare dashboard → Workers & Pages → your project → **Settings → Environment variables**
   - `RESEND_API_KEY` — your Resend API key (tick Encrypt)
   - `LEADS_CSV_URL` — a link to the actual CSV file. Keep this **not publicly guessable** (e.g. an R2 object with a long random key, or a signed URL) since it's the actual delivery mechanism — anyone with the link could download it.
4. **Verify your sending domain in Resend** (or your emails will land in spam — same deliverability principles as the cold outreach we covered earlier: proper SPF/DKIM records matter here too).
5. **Test it:** PayPal lets you send a test IPN from Account Settings → Notifications → IPN history → "Simulate," or just make a real $1 test payment to yourself.

### If you'd rather not automate yet

Since this is just starting out, it's also completely fine to handle the
first several sales manually: check your PayPal account for new payments,
then email the CSV yourself. Wire up the IPN automation whenever volume
makes that worth the setup time — nothing above is required to start selling.

## Why the payment can't just "download the file directly"

If the download link were public, anyone could grab it without paying. The serverless function is the one piece that checks with Stripe ("did this specific session actually get paid?") before handing out a real link — and that link expires in 5 minutes so it can't be shared around afterward.

## In the meantime — Stripe is disabled, you need Visa/Mastercard + PayPal now

You have two reasonable options while you wait on Stripe:

**Option 1 — Wait it out.** Everything above is ready to go the moment your account is reactivated; you'd just fill in the Payment Link URL and deploy.

**Option 2 — PayPal Buttons as a stopgap.** PayPal's own Smart Payment Buttons accept PayPal balance, Venmo, and credit/debit cards (Visa/Mastercard/Amex) without needing Stripe at all:
- Set up a PayPal Business account and create a button in the PayPal dashboard
- Use their IPN (Instant Payment Notification) webhook the same way as the Stripe webhook above — it confirms payment server-side, then your function hands out the signed download link
- Swap it back to Stripe later without customers noticing anything — same success page, same download flow

Happy to build out either the Vercel deployment or the PayPal version in full if you want to go that route while Stripe is under review — just say the word.
