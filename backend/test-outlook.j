require('dotenv').config();
const nodemailer = require('nodemailer');

async function testOutlook() {
  console.log('Testing Outlook configuration...');
  console.log('Email:', process.env.OUTLOOK_USER);
  
  const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false, // false for port 587
    auth: {
      user: process.env.OUTLOOK_USER,
      pass: process.env.OUTLOOK_PASSWORD
    }
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ Outlook connection successful!');
    
    // Try sending a test email to yourself
    const result = await transporter.sendMail({
      from: process.env.OUTLOOK_USER,
      to: process.env.OUTLOOK_USER, // Send to yourself for testing
      subject: 'Test Email from BOCHABERI System',
      text: 'If you receive this, your Outlook email is working correctly!'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('\nCheck your Outlook inbox in 1-2 minutes');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nCommon issues:');
    console.log('1. Wrong password - make sure you typed it correctly');
    console.log('2. Account needs verification - check your Outlook email for verification requests');
    console.log('3. New account restriction - new Outlook accounts may have temporary sending limits');
  }
}

testOutlook();