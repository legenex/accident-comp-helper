// Contact form email relay. Sends the visitor's message to the support
// inbox via the Base44 SendEmail integration (the app's connected email
// account). Public and unauthenticated — visitors are not app users — so
// inputs are validated and bounded here to keep abuse in check.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const SUPPORT_TO = 'support@accidentcompensationhelper.com';
const MAX_NAME = 120;
const MAX_EMAIL = 160;
const MAX_MESSAGE = 4000;

const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);
}

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body.name || '').toString().trim().slice(0, MAX_NAME);
    const email = (body.email || '').toString().trim().slice(0, MAX_EMAIL);
    const message = (body.message || '').toString().trim().slice(0, MAX_MESSAGE);

    if (!name || !email || !message) {
      return Response.json({ ok: false, error: 'Name, email, and message are required.' }, { status: 400 });
    }
    // Basic email shape check — the integration validates delivery, this just
    // stops obvious garbage from producing a confusing error.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const subject = `New contact form message from ${name}`;
    const textBody = [
      `New message from the Accident Compensation Helper contact form.`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      ``,
      `Message:`,
      message,
    ].join('\n');
    const htmlBody = [
      `<p>New message from the Accident Compensation Helper contact form.</p>`,
      `<p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Email:</strong> ${escapeHtml(email)}</p>`,
      `<p><strong>Message:</strong></p>`,
      `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
    ].join('\n');

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: SUPPORT_TO,
      subject,
      text: textBody,
      html: htmlBody,
      from_name: 'ACH Contact Form',
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || String(error) }, { status: 500 });
  }
}