const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER || 'your_brevo_email@example.com',
        pass: process.env.BREVO_API_KEY
      }
    });
  }
  return transporter;
}

async function sendOTP(email, code, purpose = 'login') {
  try {
    const transporter = getTransporter();
    
    let subject = '';
    let htmlContent = '';
    
    if (purpose === 'login') {
      subject = `Your Login Code - BOCHABERI`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #1a365d;">BOCHABERI Construction Suite</h2>
          <h3>Your Login Code</h3>
          <p>Use the following code to log in to your account:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px; letter-spacing: 5px;">${code}</div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 5 minutes. Do not share this code with anyone.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #999; font-size: 10px;">BOCHABERI Construction Management System</p>
        </div>
      `;
    } else if (purpose === 'registration') {
      subject = `Verify Your Registration - BOCHABERI`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #1a365d;">BOCHABERI Construction Suite</h2>
          <h3>Verify Your Registration</h3>
          <p>Use the following code to complete your registration:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px; letter-spacing: 5px;">${code}</div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 5 minutes.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #999; font-size: 10px;">BOCHABERI Construction Management System</p>
        </div>
      `;
    } else if (purpose === 'invitation') {
      subject = `You've Been Invited - BOCHABERI`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #1a365d;">BOCHABERI Construction Suite</h2>
          <h3>You've Been Invited!</h3>
          <p>Use the following code to complete your registration:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px; letter-spacing: 5px;">${code}</div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 5 minutes.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #999; font-size: 10px;">BOCHABERI Construction Management System</p>
        </div>
      `;
    }
    
    const info = await transporter.sendMail({
      from: `"${process.env.BREVO_SENDER_NAME || 'BOCHABERI'}" <${process.env.BREVO_SENDER_EMAIL || 'noreply@bochaberi.com'}>`,
      to: email,
      subject: subject,
      html: htmlContent
    });
    
    console.log(`✅ OTP sent to ${email} for ${purpose}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

async function sendInvitationCode(email, code, inviterName, companyName) {
  try {
    const transporter = getTransporter();
    
    const info = await transporter.sendMail({
      from: `"${process.env.BREVO_SENDER_NAME || 'BOCHABERI'}" <${process.env.BREVO_SENDER_EMAIL || 'noreply@bochaberi.com'}>`,
      to: email,
      subject: `Invitation to join ${companyName} on BOCHABERI`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #1a365d;">BOCHABERI Construction Suite</h2>
          <h3>You've Been Invited!</h3>
          <p><strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong>.</p>
          <p>Use the following code to complete your registration:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px; letter-spacing: 5px;">${code}</div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 5 minutes.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #999; font-size: 10px;">BOCHABERI Construction Management System</p>
        </div>
      `
    });
    
    console.log(`✅ Invitation sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Invitation send error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendOTP, sendInvitationCode };