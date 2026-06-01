require('dotenv').config();

async function testBrevo() {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.SMTP_USER; // Your verified Brevo sender email

    if (!apiKey) {
      console.error('Error: BREVO_API_KEY is missing from your .env file!');
      return;
    }
    if (!senderEmail) {
      console.error('Error: SMTP_USER is missing from your .env file!');
      return;
    }

    console.log(`Attempting to send email via Brevo...`);
    console.log(`Sender: ${senderEmail}`);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'aura Invoice AI Test',
          email: senderEmail
        },
        to: [{ email: 'brahimojaballi@gmail.com' }], // Sending to yourself as a test
        subject: 'Brevo API Test',
        htmlContent: '<p>If you are reading this, your Brevo API key works perfectly!</p>',
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Brevo API Error Details:');
      console.error(errorData);
    } else {
      const data = await response.json();
      console.log('Success! The email was sent.');
      console.log('Message ID:', data.messageId);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testBrevo();
