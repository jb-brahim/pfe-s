require('dotenv').config();
const nodemailer = require('nodemailer');

async function testMail() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS.replace(/\"/g, '').replace(/\s+/g, '') // Test without spaces and quotes
      }
    });
    
    console.log('Attempting to send email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'brahimojaballi@gmail.com',
      subject: 'Test Mail Debugging',
      text: 'This is a test to see why it fails.'
    });
    console.log('Success! Message ID: ' + info.messageId);
  } catch(err) {
    console.error('Mail sending failed with error:');
    console.error(err);
  }
}

testMail();
