const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'mail.bochi.ke',
      port: parseInt(process.env.EMAIL_PORT) || 465,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'noreply@bochi.ke',
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  return transporter;
}

async function sendOTP(email, code, purpose = 'login') {
  try {
    const transporter = getTransporter();
    const subject = `Your Login Code - Bochi Construction Suite`;
    const html = `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #1a365d;">Bochi Construction Suite</h2>
      <h3>Your Login Code</h3>
      <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px;">${code}</div>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 5 minutes.</p>
      <hr>
      <p style="color: #999; font-size: 10px;">Bochi Construction Suite - Construction Management System</p>
    </div>`;
    
    await transporter.sendMail({
      from: `"Bochi Construction Suite" <${process.env.EMAIL_USER || 'noreply@bochi.ke'}>`,
      to: email,
      subject: subject,
      html: html
    });
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}

async function sendInvitationCode(email, code, inviterName, companyName) {
  try {
    const transporter = getTransporter();
    const subject = `Invitation to join ${companyName} on Bochi Construction Suite`;
    const html = `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #1a365d;">Bochi Construction Suite</h2>
      <h3>You've Been Invited!</h3>
      <p>Use the following code to complete your registration:</p>
      <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px;">${code}</div>
      <hr>
      <p style="color: #999; font-size: 10px;">Bochi Construction Suite</p>
    </div>`;
    
    await transporter.sendMail({
      from: `"Bochi Construction Suite" <${process.env.EMAIL_USER || 'noreply@bochi.ke'}>`,
      to: email,
      subject: subject,
      html: html
    });
    return { success: true };
  } catch (error) {
    console.error('Invitation error:', error);
    return { success: false };
  }
}

// Simple stakeholder invitation
async function sendStakeholderInvitation(email, name, tempPassword, projectName, stakeholderType, inviterName) {
  try {
    const transporter = getTransporter();
    const subject = `You've been invited to join ${projectName} on Bochi Construction Suite`;
    const html = `<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #1a365d;">Bochi Construction Suite</h2>
      <p>Dear ${name},</p>
      <p><strong>${inviterName}</strong> has invited you to join the project <strong>${projectName}</strong>.</p>
      <p>Your temporary password is: <strong>${tempPassword}</strong></p>
      <p>Please log in and change your password.</p>
      <hr>
      <p style="color: #999; font-size: 10px;">Bochi Construction Suite</p>
    </div>`;
    
    await transporter.sendMail({
      from: `"Bochi Construction Suite" <${process.env.EMAIL_USER || 'noreply@bochi.ke'}>`,
      to: email,
      subject: subject,
      html: html
    });
    console.log(`✅ Invitation sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Invitation error:', error);
    return false;
  }
}

// For super admin bulk email
async function sendBulkEmail(recipients, subject, message) {
  let successCount = 0;
  for (const email of recipients) {
    try {
      await transporter.sendMail({
        from: `"Bochi Construction Suite" <${process.env.EMAIL_USER || 'noreply@bochi.ke'}>`,
        to: email,
        subject: subject,
        html: message
      });
      successCount++;
    } catch (error) {
      console.error(`Failed to send to ${email}:`, error.message);
    }
  }
  return { successCount, failCount: recipients.length - successCount };
}

// Generic send email
async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Bochi Construction Suite" <${process.env.EMAIL_USER || 'noreply@bochi.ke'}>`,
      to: to,
      subject: subject,
      html: html
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function verifyTransporter() {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('✅ Email transporter verified');
    return true;
  } catch (error) {
    console.error('Email verification failed:', error.message);
    return false;
  }
}

module.exports = { 
  sendOTP, 
  sendInvitationCode, 
  sendStakeholderInvitation,
  sendBulkEmail,
  sendEmail,
  verifyTransporter
};