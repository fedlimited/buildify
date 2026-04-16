const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  return transporter;
}

async function sendOTP(email, code, purpose = 'login') {
  const purposeText = purpose === 'login' ? 'log in to' : 'register for';
  
  // Always show in console
  console.log('\n🔐 ========================================');
  console.log(`📧 TO: ${email}`);
  console.log(`🔑 OTP CODE: ${code}`);
  console.log(`📝 PURPOSE: ${purpose}`);
  console.log('========================================\n');
  
  // Send real email
  try {
    const transporter = getTransporter();
    
    await transporter.sendMail({
      from: `"BOCHABERI Construction" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your ${purpose} verification code - BOCHABERI`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .code { font-size: 32px; font-weight: bold; color: #1a56db; padding: 20px; background: #f3f4f6; text-align: center; letter-spacing: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>BOCHABERI Construction Suite</h2>
            <p>Your verification code to ${purposeText} BOCHABERI is:</p>
            <div class="code">${code}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr>
            <p style="font-size: 12px; color: #666;">BOCHABERI Construction Suite - Project Management System</p>
          </div>
        </body>
        </html>
      `,
      text: `BOCHABERI Construction Suite\n\nYour verification code to ${purposeText} BOCHABERI is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`
    });
    
    console.log(`✅ Email sent successfully to ${email}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error.message);
    return false;
  }
}

async function sendInvitationCode(email, code, inviterName, companyName) {
  console.log('\n📨 ========================================');
  console.log(`📧 TO: ${email}`);
  console.log(`🎫 INVITATION CODE: ${code}`);
  console.log(`👤 FROM: ${inviterName}`);
  console.log(`🏢 COMPANY: ${companyName}`);
  console.log('========================================\n');
  
  try {
    const transporter = getTransporter();
    
    await transporter.sendMail({
      from: `"${inviterName} via BOCHABERI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invitation to join ${companyName} on BOCHABERI`,
      html: `
        <h2>You're Invited!</h2>
        <p><strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong> on BOCHABERI Construction Suite.</p>
        <p>Your invitation code: <strong style="font-size: 24px;">${code}</strong></p>
        <p>This code expires in 30 minutes.</p>
        <p>Click here to register: <a href="https://app.bochaberi.com/register">Register Now</a></p>
      `,
      text: `You're invited to join ${companyName} on BOCHABERI.\n\nYour invitation code: ${code}\n\nExpires in 30 minutes.\n\nRegister at: https://app.bochaberi.com/register`
    });
    
    console.log(`✅ Invitation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send invitation:`, error.message);
    return false;
  }
}

async function verifyTransporter() {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('✅ Email service is ready (Gmail)');
    console.log(`📧 Sending from: ${process.env.EMAIL_USER}`);
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    console.log('📝 Continuing in fallback mode (OTP shown in console only)');
    return false;
  }
}

module.exports = { sendOTP, sendInvitationCode, verifyTransporter };