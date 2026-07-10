// Tycoon Clap — shared utility script
document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.navlinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  // Animated counters
  const counters = document.querySelectorAll('[data-count-target]');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseFloat(el.getAttribute('data-count-target'));
      const suffix = el.getAttribute('data-count-suffix') || '';
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        el.textContent = current + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => counterObserver.observe(el));
  }

  // ============================================================
  // FORM SUBMISSION — sends every form on the site to your Gmail
  // Works across ALL pages: home lead form, services booking form,
  // and the contact page form — each identified by data-ajax-form,
  // not by a single shared id, so all three work independently.
  // ============================================================
  const WEB3FORMS_ACCESS_KEY = "7a29027e-dfab-4233-9f12-6483da861897";

  document.querySelectorAll('form[data-ajax-form]').forEach((form) => {
    const statusEl = form.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      try {
        const formData = new FormData(form);
        formData.append('access_key', WEB3FORMS_ACCESS_KEY);
        const formName = form.getAttribute('data-form-name') || 'Website enquiry';
        formData.append('subject', `New ${formName} — Tycoon Clap website`);

        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' }
        });
        const result = await response.json();

        if (result.success) {
          if (statusEl) statusEl.textContent = "Thanks — that's in. We'll get back to you soon.";
          form.reset();
          const dl = form.getAttribute('data-unlock-target');
          if (dl) {
            const target = document.querySelector(dl);
            if (target) target.classList.add('unlocked');
          }
        } else {
          if (statusEl) statusEl.textContent = 'Something went wrong. Please try again or WhatsApp us directly.';
        }
      } catch (err) {
        if (statusEl) statusEl.textContent = "Couldn't send right now — please WhatsApp us directly.";
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  });
});
