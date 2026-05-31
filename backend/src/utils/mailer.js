const sendMail = async (to, subject, text, html) => {
  try {
    if (!process.env.BREVO_API_KEY || !process.env.SMTP_USER) {
      console.warn('[MAILER] BREVO_API_KEY or SMTP_USER not set in environment. Skipping email dispatch.');
      return { success: false, error: 'Credentials missing' };
    }

    console.log(`[MAILER] Attempting to send email to: ${to} using Brevo HTTP API...`);
    
    // We use the built-in fetch API to bypass Render's SMTP block (Port 443)
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'aura Invoice AI',
          email: process.env.SMTP_USER // This MUST be your verified Gmail address in Brevo
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html || `<p>${text}</p>`,
        textContent: text
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[MAILER] Brevo API Error:', errorData);
      return { success: false, error: errorData };
    }

    const data = await response.json();
    console.log(`[MAILER] Email sent successfully to ${to} via Brevo. Message ID: ${data.messageId}`);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('[MAILER] Unexpected error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendMail };
