/*
  Contact form (docs/SITE_SPEC.md > 10 Contact). Phase 3: UI and validation.
  - With data-endpoint (PUBLIC_FORM_ENDPOINT, phase 5): POST JSON; success or error state.
  - Without it: open the visitor's email app with the message filled in, to hello@tenonpath.com.
  - Honeypot filled: pretend nothing happened (no send, no error).
  - Review previews: ?form=success or ?form=error
*/
import { playLogo } from './logo';

const TO = 'hello@tenonpath.com';
const REQUIRED = ['name', 'email', 'systems'] as const;
const LABELS: Record<string, string> = {
  name: 'Name',
  email: 'Email',
  company: 'Company',
  systems: 'What systems do you use today?',
  wants: 'What do you want to see in one place?',
  budget: 'Budget range',
  source: 'How did you hear about us?',
};

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
if (form) init(form);

function init(form: HTMLFormElement) {
  const success = document.querySelector<HTMLElement>('[data-form-success]')!;
  const errorBox = form.querySelector<HTMLElement>('[data-form-error]')!;
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const endpoint = form.dataset.endpoint || '';

  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement | null;

  function validOne(name: string) {
    const el = field(name);
    if (!el) return true;
    const value = el.value.trim();
    const ok = name === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : value.length > 0;
    el.setAttribute('aria-invalid', String(!ok));
    const msg = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (msg) msg.hidden = ok;
    return ok;
  }

  // Re-check a field once the visitor has been told it needs fixing.
  REQUIRED.forEach((name) => {
    const el = field(name);
    el?.addEventListener('input', () => {
      if (el.getAttribute('aria-invalid') === 'true') validOne(name);
    });
    el?.addEventListener('change', () => {
      if (el.getAttribute('aria-invalid') === 'true') validOne(name);
    });
  });

  function showSuccess() {
    form.hidden = true;
    success.hidden = false;
    success.focus({ preventScroll: true });
    const mark = success.querySelector<SVGSVGElement>('svg[data-logo]');
    if (mark) playLogo(mark, { force: true });
  }
  function showError() {
    errorBox.hidden = false;
    status.textContent = '';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;

    const results = REQUIRED.map((n) => validOne(n));
    if (results.includes(false)) {
      const first = REQUIRED[results.indexOf(false)];
      field(first)?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (data.website) return; // honeypot
    delete data.website;

    if (!endpoint) {
      // No backend yet (phase 5). Hand the message to the visitor's email app instead.
      const body = Object.entries(data)
        .filter(([, v]) => v.trim())
        .map(([k, v]) => `${LABELS[k] ?? k}:\n${v.trim()}`)
        .join('\n\n');
      const subject = `Project enquiry from ${data.name.trim()}`;
      window.location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = 'Your email app should open with this message ready to send.';
      return;
    }

    submit.disabled = true;
    status.textContent = 'Sending';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      status.textContent = '';
      showSuccess();
    } catch {
      showError();
    } finally {
      submit.disabled = false;
    }
  });

  // Review previews
  const preview = new URLSearchParams(location.search).get('form');
  if (preview === 'success') showSuccess();
  if (preview === 'error') showError();
}
