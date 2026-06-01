const { Resend } = require('resend');

async function testResend() {
  try {
    const resend = new Resend('re_W57c5Qos_7rz1gPdrC8gRMi923Jx9Ccd8');
    
    console.log('Sending email via Resend...');
    const { data, error } = await resend.emails.send({
      from: 'aura Invoice AI <onboarding@resend.dev>',
      to: ['brahimojaballi@gmail.com'],
      subject: 'Resend Debugging Test',
      html: '<p>This is a test from Resend!</p>'
    });

    if (error) {
      console.error('Error from Resend API:', error);
    } else {
      console.log('Success! Email ID:', data.id);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testResend();
