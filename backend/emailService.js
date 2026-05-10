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
      subject = `Your Login Code - Bochaberi`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #1a365d;">Bochaberi Construction Suite</h2>
          <h3>Your Login Code</h3>
          <p>Use the following code to log in to your account:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px; letter-spacing: 5px;">${code}</div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 5 minutes. Do not share this code with anyone.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #999; font-size: 10px;">Bochaberi Construction Management System</p>
        </div>
      `;
    } else if (purpose === 'registration') {
      subject = `Verify Your Registration - Bochaberi`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #1a365d;">Bochaberi Construction Suite</h2>
          <h3>Verify Your Registration</h3>
          <p>Use the following code to complete your registration:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px; letter-spacing: 5px;">${code}</div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 5 minutes.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #999; font-size: 10px;">Bochaberi Construction Management System</p>
        </div>
      `;
    } else if (purpose === 'invitation') {
      subject = `You've Been Invited - Bochaberi`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #1a365d;">Bochaberi Construction Suite</h2>
          <h3>You've Been Invited!</h3>
          <p>Use the following code to complete your registration:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px; letter-spacing: 5px;">${code}</div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 5 minutes.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #999; font-size: 10px;">Bochaberi Construction Management System</p>
        </div>
      `;
    }
    
    const info = await transporter.sendMail({
      from: `"${process.env.BREVO_SENDER_NAME || 'Bochaberi'}" <${process.env.BREVO_SENDER_EMAIL || 'noreply@Bochaberi.com'}>`,
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
      from: `"${process.env.BREVO_SENDER_NAME || 'Bochaberi'}" <${process.env.BREVO_SENDER_EMAIL || 'noreply@Bochaberi.com'}>`,
      to: email,
      subject: `Invitation to join ${companyName} on Bochaberi`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #1a365d;">Bochaberi Construction Suite</h2>
          <h3>You've Been Invited!</h3>
          <p><strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong>.</p>
          <p>Use the following code to complete your registration:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px; letter-spacing: 5px;">${code}</div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 5 minutes.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #999; font-size: 10px;">Bochaberi Construction Management System</p>
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


// ========== STAKEHOLDER INVITATION EMAIL ==========
async function sendStakeholderInvitation(email, name, tempPassword, projectName, stakeholderType, inviterName) {
    try {
        const transporter = getTransporter();
        const subject = `You've been invited to join ${projectName} on Bochi Construction Suite`;
        
        const stakeholderTypeLabel = {
            client: 'Client/Owner',
            consultant: 'Consultant',
            architect: 'Architect',
            structural_engineer: 'Structural Engineer',
            electrical_engineer: 'Electrical Engineer',
            mechanical_engineer: 'Mechanical Engineer',
            quantity_surveyor: 'Quantity Surveyor',
            project_manager: 'Project Manager'
        }[stakeholderType] || stakeholderType;
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #1a365d;">Bochi Construction Suite</h2>
                <p>Dear ${name},</p>
                <p><strong>${inviterName}</strong> has invited you to join the project <strong>${projectName}</strong> as a <strong>${stakeholderTypeLabel}</strong>.</p>
                <p>Your temporary login credentials are:</p>
                <div style="background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                </div>
                <p>Please log in and change your password immediately.</p>
                <p><a href="${process.env.FRONTEND_URL || 'https://bochi.ke'}/login" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Your Account</a></p>
                <hr>
                <p style="font-size: 12px; color: #666;">Bochi Construction Suite - Construction Management System</p>
            </div>
        `;
        
        await transporter.sendMail({
            from: `"Bochi Construction Suite" <${process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_FROM || 'noreply@bochi.ke'}>`,
            to: email,
            subject: subject,
            html: html
        });
        
        console.log(`✅ Stakeholder invitation sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Stakeholder invitation error:', error);
        return false;
    }
}




module.exports = { 
    sendOTP, 
    sendInvitationCode,
    sendStakeholderInvitation
};