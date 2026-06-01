const nodemailer = require('nodemailer');

const sendMail = async (to, subject, text, html) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('[MAILER] SMTP_USER or SMTP_PASS not set in environment. Skipping email dispatch.');
      return { success: false, error: 'Credentials missing' };
    }

    console.log(`[MAILER] Attempting to send email to: ${to} using local SMTP...`);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"aura Invoice AI" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`
    });

    console.log(`[MAILER] Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[MAILER] Unexpected error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendMail };
