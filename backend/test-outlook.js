require('dotenv').config();
const nodemailer = require('nodemailer');

async function testOutlook() {
  console.log('Testing Outlook configuration...');
  console.log('Email:', process.env.OUTLOOK_USER);
  
  const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.OUTLOOK_USER,
      pass: process.env.OUTLOOK_PASSWORD
    }
  });

  try {
    await transporter.verify();
    console.log('✅ Outlook connection successful!');
    
    const result = await transporter.sendMail({
      from: process.env.OUTLOOK_USER,
      to: process.env.OUTLOOK_USER,
      subject: 'Test Email from BOCHABERI System',
      text: 'If you receive this, your Outlook email is working correctly!'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testOutlook();