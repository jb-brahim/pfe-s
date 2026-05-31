const { Resend } = require('resend');

const sendMail = async (to, subject, text, html) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[MAILER] RESEND_API_KEY not set in environment. Skipping email dispatch.');
      return { success: false, error: 'RESEND_API_KEY missing' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log(`[MAILER] Attempting to send email to: ${to} using Resend HTTP API...`);
    
    // IMPORTANT: When using Resend without a verified custom domain, 
    // the 'from' address MUST be 'onboarding@resend.dev'.
    const { data, error } = await resend.emails.send({
      from: 'aura Invoice AI <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html || `<p>${text}</p>`,
    });

    if (error) {
      console.error('[MAILER] Resend API Error:', error);
      return { success: false, error: error.message };
    }

    console.log(`[MAILER] Email sent successfully to ${to} via Resend. ID: ${data.id}`);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('[MAILER] Unexpected error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendMail };
