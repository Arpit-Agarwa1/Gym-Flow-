import nodemailer from 'nodemailer';

let transporter = null;

function getTransport() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user) return null;
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

/**
 * Sends email when SMTP is configured; otherwise logs to console (dev).
 */
export async function sendMail({ to, subject, text, html }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const t = getTransport();
  if (!t || !from) {
    console.info('[email stub]', { to, subject, text: text?.slice?.(0, 200) });
    return { stub: true };
  }
  return t.sendMail({ from, to, subject, text, html: html || text });
}
