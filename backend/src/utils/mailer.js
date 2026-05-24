const nodemailer = require('nodemailer');

const sendMail = async (to, subject, text, html) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('[MAILER] SMTP_USER or SMTP_PASS not set in .env. Skipping email dispatch.');
      return { success: false, error: 'SMTP credentials missing' };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // This must be a Google App Password
      },
    });

    const info = await transporter.sendMail({
      from: `"aura Invoice AI" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`[MAILER] Email sent successfully to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[MAILER] Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendMail };
