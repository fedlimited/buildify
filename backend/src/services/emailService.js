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


// Helper function to escape HTML special characters
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function sendStakeholderInvitation(email, name, projectName, role, inviterName, subdomain, companyName) {
    try {
        const transporter = getTransporter();
        if (!transporter) {
            console.error('❌ Email transporter not configured');
            return { success: false, error: 'Email service not configured' };
        }
        
        // CORRECTED: Login URL is bochi.ke/login (not subdomain-specific)
        const loginUrl = `https://bochi.ke/login`;
        const fullPortalUrl = `${subdomain}.bochi.ke`;
        const displayCompanyName = companyName || 'BOCHI Construction Suite';
        
        // HTML Version with Amber Aesthetics
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Invitation to Collaborate</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        line-height: 1.6;
                        background-color: #fef9f0;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: #ffffff;
                        border-radius: 20px;
                        overflow: hidden;
                        box-shadow: 0 20px 35px -10px rgba(245, 158, 11, 0.15);
                        border: 1px solid #fde68a;
                    }
                    .header {
                        background: linear-gradient(135deg, #f59e0b, #d97706, #b45309);
                        padding: 40px 30px;
                        text-align: center;
                        color: white;
                        position: relative;
                    }
                    .header::before {
                        content: "✦";
                        position: absolute;
                        bottom: -15px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: white;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #f59e0b;
                        font-size: 18px;
                        font-weight: bold;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    .header h2 {
                        margin: 0;
                        color: white;
                        font-size: 28px;
                        letter-spacing: -0.5px;
                    }
                    .header p {
                        margin: 10px 0 0 0;
                        opacity: 0.95;
                        font-size: 14px;
                    }
                    .content {
                        padding: 35px 30px;
                        background: #ffffff;
                    }
                    .greeting {
                        font-size: 16px;
                        color: #374151;
                        margin-bottom: 20px;
                    }
                    .greeting strong {
                        color: #d97706;
                    }
                    .invitation-text {
                        background: linear-gradient(135deg, #fffbeb, #fef3c7);
                        padding: 20px;
                        border-radius: 16px;
                        margin: 20px 0;
                        border-left: 4px solid #f59e0b;
                        color: #374151;
                    }
                    .invitation-text strong {
                        color: #d97706;
                    }
                    .subdomain-box {
                        background: linear-gradient(135deg, #fef3c7, #fde68a);
                        padding: 20px;
                        border-radius: 16px;
                        margin: 25px 0;
                        text-align: center;
                        border: 1px solid #fbbf24;
                        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
                    }
                    .subdomain-label {
                        font-size: 13px;
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                        color: #92400e;
                        margin-bottom: 8px;
                        font-weight: 600;
                    }
                    .subdomain-text {
                        font-size: 32px;
                        font-weight: 800;
                        font-family: monospace;
                        background: linear-gradient(135deg, #b45309, #d97706);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        letter-spacing: 1px;
                    }
                    .subdomain-url {
                        font-size: 13px;
                        color: #78350f;
                        margin-top: 8px;
                        opacity: 0.8;
                    }
                    .url-wrapper {
                        background: linear-gradient(135deg, #fef3c7, #fffbeb);
                        padding: 10px 20px;
                        border-radius: 50px;
                        display: inline-block;
                        margin: 15px 0;
                        border: 2px solid #fbbf24;
                        box-shadow: 0 4px 10px rgba(245, 158, 11, 0.15);
                    }
                    .url-text {
                        font-size: 15px;
                        font-weight: 600;
                        font-family: monospace;
                        color: #92400e;
                        word-break: break-all;
                    }
                    .url-icon {
                        color: #f59e0b;
                        margin-right: 6px;
                    }
                    .instructions {
                        background: #fef9f0;
                        padding: 25px;
                        border-radius: 16px;
                        margin: 25px 0;
                        border: 1px solid #fde68a;
                    }
                    .instructions-title {
                        font-weight: 700;
                        margin: 0 0 15px 0;
                        color: #b45309;
                        font-size: 16px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .instructions ol {
                        margin: 0;
                        padding-left: 20px;
                    }
                    .instructions li {
                        margin: 12px 0;
                        color: #374151;
                    }
                    .instructions li strong {
                        color: #d97706;
                        background: #fef3c7;
                        padding: 2px 6px;
                        border-radius: 6px;
                        font-size: 13px;
                    }
                    .button {
                        display: inline-block;
                        background: linear-gradient(135deg, #f59e0b, #d97706);
                        color: white;
                        padding: 14px 32px;
                        text-decoration: none;
                        border-radius: 50px;
                        font-weight: 700;
                        transition: all 0.3s ease;
                        box-shadow: 0 6px 14px rgba(245, 158, 11, 0.3);
                        border: none;
                        margin: 10px 0;
                    }
                    .button:hover {
                        background: linear-gradient(135deg, #d97706, #b45309);
                        transform: translateY(-2px);
                        box-shadow: 0 10px 20px rgba(245, 158, 11, 0.4);
                    }
                    .divider {
                        margin: 30px 0 20px;
                        border: none;
                        height: 2px;
                        background: linear-gradient(90deg, transparent, #fde68a, #f59e0b, #fde68a, transparent);
                    }
                    .footer {
                        text-align: center;
                        padding: 25px;
                        background: linear-gradient(135deg, #fef9f0, #fffbeb);
                        border-top: 1px solid #fde68a;
                    }
                    .footer p {
                        margin: 5px 0;
                        font-size: 12px;
                        color: #78350f;
                    }
                    .footer a {
                        color: #d97706;
                        text-decoration: none;
                        font-weight: 600;
                    }
                    .footer a:hover {
                        text-decoration: underline;
                    }
                    .badge {
                        display: inline-block;
                        background: #fef3c7;
                        color: #b45309;
                        padding: 4px 12px;
                        border-radius: 50px;
                        font-size: 12px;
                        font-weight: 600;
                        margin-top: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>✨ ${escapeHtml(displayCompanyName)}</h2>
                        <p>You've been invited to collaborate!</p>
                    </div>
                    <div class="content">
                        <div class="greeting">
                            Dear <strong>${escapeHtml(name)}</strong>,
                        </div>
                        
                        <div class="invitation-text">
                            📌 <strong>${escapeHtml(inviterName)}</strong> has invited you to join <strong>${escapeHtml(projectName)}</strong> as a <strong>${escapeHtml(role)}</strong>.
                        </div>
                        
                        <div class="subdomain-box">
                            <div class="subdomain-label">🏢 YOUR COMPANY SUBDOMAIN</div>
                            <div class="subdomain-text">${escapeHtml(subdomain)}</div>
                            <div class="subdomain-url">🔗 ${escapeHtml(fullPortalUrl)}</div>
                        </div>
                        
                        <div style="text-align: center;">
                            <div class="url-wrapper">
                                <span class="url-icon">🔐</span>
                                <span class="url-text">https://bochi.ke/login</span>
                            </div>
                        </div>
                        
                        <div class="instructions">
                            <div class="instructions-title">
                                <span>📋</span> LOGIN INSTRUCTIONS
                            </div>
                            <ol>
                                <li>Click the <strong>amber button</strong> below or go to <strong>bochi.ke/login</strong></li>
                                <li>Enter your subdomain: <strong>${escapeHtml(subdomain)}</strong></li>
                                <li>Enter your email address: <strong>${escapeHtml(email)}</strong></li>
                                <li>Click <strong>"Request OTP"</strong> to receive a one-time password</li>
                                <li>Enter the OTP to complete login</li>
                            </ol>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="https://bochi.ke/login" class="button">
                                🚀 LOGIN TO YOUR PORTAL
                            </a>
                        </div>
                        
                        <div class="divider"></div>
                        
                        <p style="font-size: 13px; color: #78350f; text-align: center; margin: 20px 0 0;">
                            🔒 You will only have access to information related to this specific project.
                        </p>
                    </div>
                    <div class="footer">
                        <p><strong>Admin:</strong> ${escapeHtml(displayCompanyName)}</p>
                        <p><a href="https://bochi.ke">🌐 bochi.ke</a></p>
                        <div class="badge">⚡ Powered by Bochi</div>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        // Plain Text Version
        const text = `✨ ${displayCompanyName} - Invitation to Collaborate

Dear ${name},

${inviterName} has invited you to join ${projectName} as a ${role}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 YOUR COMPANY SUBDOMAIN: ${subdomain}
🔗 Portal URL: ${fullPortalUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 LOGIN URL: https://bochi.ke/login

📋 LOGIN INSTRUCTIONS:
1. Go to https://bochi.ke/login
2. Enter your subdomain: ${subdomain}
3. Enter your email address: ${email}
4. Click "Request OTP" to receive a one-time password
5. Enter the OTP to complete login

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin: ${displayCompanyName} | bochi.ke
⚡ Powered by Bochi`;
        
        await transporter.sendMail({
            from: `"${displayCompanyName}" <${process.env.EMAIL_FROM || 'noreply@bochi.ke'}>`,
            to: email,
            subject: `✨ Invitation to collaborate on ${projectName}`,
            html: html,
            text: text
        });
        
        console.log(`✅ Stakeholder invitation sent to ${email} for ${displayCompanyName} (${subdomain})`);
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