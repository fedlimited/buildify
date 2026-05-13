const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    // Use your actual email configuration from Render
    const host = process.env.EMAIL_HOST || 'mail.bochi.ke';
    const port = parseInt(process.env.EMAIL_PORT) || 465;
    const secure = process.env.EMAIL_SECURE === 'true';
    
    console.log(`📧 Configuring email: ${host}:${port} (secure: ${secure})`);
    
    transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure,
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
    
    if (!transporter) {
      console.error('❌ Email transporter not configured');
      return { success: false, error: 'Email service not configured' };
    }
    
    let subject = '';
    let htmlContent = '';

    if (purpose === 'login') {
      subject = `Your Login Code - Bochi Construction Suite`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #1a365d;">Bochi Construction Suite</h2>
          <h3>Your Login Code</h3>
          <p>Use the following code to log in to your account:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px; letter-spacing: 5px;">${code}</div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 5 minutes. Do not share this code with anyone.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #999; font-size: 10px;">Bochi Construction Suite - Construction Management System</p>
        </div>
      `;
    } else if (purpose === 'registration') {
      subject = `Verify Your Registration - Bochi Construction Suite`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #1a365d;">Bochi Construction Suite</h2>
          <h3>Verify Your Registration</h3>
          <p>Use the following code to complete your registration:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px; letter-spacing: 5px;">${code}</div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 5 minutes.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #999; font-size: 10px;">Bochi Construction Suite - Construction Management System</p>
        </div>
      `;
    } else if (purpose === 'invitation') {
      subject = `You've Been Invited - Bochi Construction Suite`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #1a365d;">Bochi Construction Suite</h2>
          <h3>You've Been Invited!</h3>
          <p>Use the following code to complete your registration:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px; letter-spacing: 5px;">${code}</div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 5 minutes.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #999; font-size: 10px;">Bochi Construction Suite - Construction Management System</p>
        </div>
      `;
    }

    const info = await transporter.sendMail({
      from: `"Bochi Construction Suite" <${process.env.EMAIL_FROM || 'noreply@bochi.ke'}>`,
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
    
    if (!transporter) {
      return { success: false, error: 'Email service not configured' };
    }

    const info = await transporter.sendMail({
      from: `"Bochi Construction Suite" <${process.env.EMAIL_FROM || 'noreply@bochi.ke'}>`,
      to: email,
      subject: `Invitation to join ${companyName} on Bochi Construction Suite`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #1a365d;">Bochi Construction Suite</h2>
          <h3>You've Been Invited!</h3>
          <p><strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong>.</p>
          <p>Use the following code to complete your registration:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px; letter-spacing: 5px;">${code}</div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This code expires in 5 minutes.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #999; font-size: 10px;">Bochi Construction Suite - Construction Management System</p>
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

// ========== DOCUMENT NOTIFICATION EMAIL ==========
async function sendDocumentNotification({ to, stakeholder_name, project_name, document, action, uploaded_by, revision_notes }) {
    try {
        const transporter = getTransporter();
        if (!transporter) return false;
        
        const actionText = action === 'upload' ? 'uploaded' : 'updated';
        const subject = `[${project_name}] New Document ${actionText}: ${document.title}`;
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #1a365d;">Document Notification</h2>
                <p>Dear ${stakeholder_name},</p>
                <p><strong>${uploaded_by}</strong> has ${actionText} a new document for project <strong>${project_name}</strong>:</p>
                <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #4F46E5; margin: 15px 0;">
                    <p><strong>Title:</strong> ${document.title}</p>
                    <p><strong>Category:</strong> ${document.category}</p>
                    <p><strong>Version:</strong> ${document.version}</p>
                    ${document.description ? `<p><strong>Description:</strong> ${document.description}</p>` : ''}
                    ${revision_notes ? `<p><strong>Revision Notes:</strong> ${revision_notes}</p>` : ''}
                </div>
                <p><a href="${document.file_url}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Document</a></p>
                <hr style="margin: 20px 0;">
                <p style="color: #999; font-size: 10px;">Bochi Construction Suite - Construction Management System</p>
            </div>
        `;
        
        await transporter.sendMail({
            from: `"Bochi Construction Suite" <${process.env.EMAIL_FROM || 'noreply@bochi.ke'}>`,
            to: to,
            subject: subject,
            html: html
        });
        
        console.log(`✅ Document notification sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Document notification error:', error);
        return false;
    }
}

// ========== TASK ASSIGNMENT EMAIL ==========
async function sendTaskAssignment({ to, assignee_name, assigner_name, project_name, minutes_title, task, due_date, priority, action_item_id }) {
    try {
        const transporter = getTransporter();
        if (!transporter) return false;
        
        const subject = `[Action Required] New Task Assigned: ${project_name}`;
        const formattedDueDate = new Date(due_date).toLocaleDateString();
        
        const priorityColors = { low: '#28a745', medium: '#ffc107', high: '#fd7e14', urgent: '#dc3545' };
        const color = priorityColors[priority] || '#ffc107';
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #1a365d;">New Task Assignment</h2>
                <p>Dear ${assignee_name},</p>
                <p><strong>${assigner_name}</strong> has assigned you a task:</p>
                <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid ${color}; margin: 15px 0;">
                    <p><strong>Project:</strong> ${project_name}</p>
                    ${minutes_title ? `<p><strong>Meeting:</strong> ${minutes_title}</p>` : ''}
                    <p><strong>Task:</strong> ${task}</p>
                    <p><strong>Due Date:</strong> ${formattedDueDate}</p>
                    <p><strong>Priority:</strong> <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 20px;">${priority.toUpperCase()}</span></p>
                </div>
                <hr style="margin: 20px 0;">
                <p style="color: #999; font-size: 10px;">Bochi Construction Suite - Construction Management System</p>
            </div>
        `;
        
        await transporter.sendMail({
            from: `"Bochi Construction Suite" <${process.env.EMAIL_FROM || 'noreply@bochi.ke'}>`,
            to: to,
            subject: subject,
            html: html
        });
        
        console.log(`✅ Task assignment sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Task assignment error:', error);
        return false;
    }
}

// ========== TASK REMINDER EMAIL ==========
async function sendTaskReminder({ to, assignee_name, task, due_date, priority, project_name, minutes_title, action_item_id }) {
    try {
        const transporter = getTransporter();
        if (!transporter) return false;
        
        const daysUntilDue = Math.ceil((new Date(due_date) - new Date()) / (1000 * 60 * 60 * 24));
        const isUrgent = daysUntilDue <= 1;
        const urgency = isUrgent ? 'URGENT' : 'Reminder';
        const subject = `[${urgency}] Task Reminder: ${project_name}`;
        
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: ${isUrgent ? '#dc3545' : '#1a365d'};">${urgency}: Task Due Soon</h2>
                <p>Dear ${assignee_name},</p>
                <p>This is a reminder for your assigned task:</p>
                <div style="background: #f5f5f5; padding: 15px; margin: 15px 0;">
                    <p><strong>Task:</strong> ${task}</p>
                    <p><strong>Due Date:</strong> ${new Date(due_date).toLocaleDateString()} ${isUrgent ? '⚠️ Due soon!' : ''}</p>
                    <p><strong>Days Remaining:</strong> ${daysUntilDue}</p>
                </div>
                <hr style="margin: 20px 0;">
                <p style="color: #999; font-size: 10px;">Bochi Construction Suite - Construction Management System</p>
            </div>
        `;
        
        await transporter.sendMail({
            from: `"Bochi Construction Suite" <${process.env.EMAIL_FROM || 'noreply@bochi.ke'}>`,
            to: to,
            subject: subject,
            html: html
        });
        
        console.log(`✅ Task reminder sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Task reminder error:', error);
        return false;
    }
}




// ========== STAKEHOLDER INVITATION EMAIL (OTP ONLY - NO PASSWORD) ==========
async function sendStakeholderInvitation(email, name, projectName, role, inviterName, subdomain) {
    try {
        const transporter = getTransporter();
        if (!transporter) {
            console.error('❌ Email transporter not configured');
            return { success: false, error: 'Email service not configured' };
        }
        
        const loginUrl = `https://bochi.ke/login?subdomain=${subdomain}`;
        
        const message = `
🏗️ Bochi Construction Suite

Dear ${name},

${inviterName} has invited you to join "${projectName}" as a ${role}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 HOW TO LOGIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to: ${loginUrl}
2. Enter subdomain: ${subdomain}
3. Enter your email: ${email}
4. Click "Send OTP"
5. Enter the OTP code you receive via email

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 YOUR ACCESS DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Login: ${loginUrl}
📧 Email: ${email}
🏢 Subdomain: ${subdomain}
📁 Project: ${projectName}
👔 Role: ${role}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions? Contact ${inviterName}.

© ${new Date().getFullYear()} Bochi Construction Suite
        `;
        
        await transporter.sendMail({
            from: `"Bochi Construction Suite" <${process.env.EMAIL_FROM || 'noreply@bochi.ke'}>`,
            to: email,
            subject: `Invitation to join ${projectName}`,
            text: message
        });
        
        console.log(`✅ Stakeholder invitation sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Stakeholder invitation error:', error);
        return { success: false, error: error.message };
    }
}




async function verifyTransporter() {
    try {
        const transporter = getTransporter();
        if (!transporter) return false;
        await transporter.verify();
        console.log('✅ Email transporter verified successfully');
        return true;
    } catch (error) {
        console.error('❌ Email transporter verification failed:', error.message);
        return false;
    }
}

module.exports = {
    sendOTP,
    sendInvitationCode,
    sendStakeholderInvitation,  // ADD THIS LINE
    sendDocumentNotification,
    sendTaskAssignment,
    sendTaskReminder,
    verifyTransporter
};