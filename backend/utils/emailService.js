/**
 * Sends email via SMTP when configured, otherwise logs to console (mock).
 * Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM in .env for real email.
 */
const sendEmail = async (to, subject, text) => {
  const normalizedTo = String(to).toLowerCase().trim();

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: normalizedTo,
        subject,
        text,
      });
      console.log(`[EMAIL SENT] To: ${normalizedTo} | Subject: ${subject}`);
      return { sent: true, mock: false };
    } catch (err) {
      console.error('[EMAIL ERROR]', err.message);
      throw new Error('Failed to send email.');
    }
  }

  console.log(`[MOCK EMAIL] To: ${normalizedTo}\nSubject: ${subject}\n${text}\n---`);
  return { sent: true, mock: true };
};

module.exports = { sendEmail };
