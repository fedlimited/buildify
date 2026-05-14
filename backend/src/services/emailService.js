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
    let messageText = '';
    
    if (purpose === 'login') {
      subject = `Your login code - Bochi`;
      messageText = 'Please use this code to log in to your account.';
    } else if (purpose === 'registration') {
      subject = `Verify your registration - Bochi`;
      messageText = 'Please use this code to complete your registration.';
    } else if (purpose === 'invitation') {
      subject = `You've been invited - Bochi`;
      messageText = 'Please use this code to complete your registration.';
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
        <title>${subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            background-color: #fef9f0;
            margin: 0;
            padding: 16px;
          }
          .container {
            max-width: 450px;
            width: 100%;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 35px -10px rgba(245, 158, 11, 0.15);
            border: 1px solid #fde68a;
          }
          .content {
            padding: 28px 20px;
            background: #ffffff;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
          }
          .message {
            color: #4b5563;
            font-size: 15px;
            margin-bottom: 25px;
            line-height: 1.5;
          }
          .code-box {
            background: linear-gradient(135deg, #fef3c7, #fffbeb);
            border: 2px solid #fbbf24;
            border-radius: 16px;
            padding: 20px 16px;
            text-align: center;
            margin: 20px 0;
          }
          .code-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #92400e;
            font-weight: 600;
            margin-bottom: 12px;
          }
          .code {
            font-size: 42px;
            font-weight: 800;
            font-family: 'Courier New', 'Monaco', monospace;
            letter-spacing: 8px;
            color: #b45309;
            background: white;
            padding: 12px 16px;
            border-radius: 12px;
            display: inline-block;
            border: 1px solid #fde68a;
            word-break: keep-all;
            white-space: nowrap;
          }
          .expiry {
            font-size: 11px;
            color: #78350f;
            margin-top: 12px;
          }
          .divider {
            margin: 25px 0 15px;
            border: none;
            height: 1px;
            background: linear-gradient(90deg, transparent, #fde68a, #f59e0b, #fde68a, transparent);
          }
          .footer {
            text-align: center;
            padding: 18px 20px;
            background: linear-gradient(135deg, #fef9f0, #fffbeb);
            border-top: 1px solid #fde68a;
          }
          .footer p {
            margin: 4px 0;
            font-size: 11px;
            color: #78350f;
          }
          .footer a {
            color: #d97706;
            text-decoration: none;
            font-weight: 600;
          }
          .security-note {
            background: #fef3c7;
            padding: 12px 14px;
            border-radius: 12px;
            font-size: 12px;
            color: #92400e;
            text-align: center;
            margin-top: 20px;
          }
          .website-link {
            text-align: center;
            margin-top: 10px;
          }
          .website-link a {
            color: #d97706;
            text-decoration: none;
            font-size: 12px;
          }
          @media only screen and (max-width: 480px) {
            .content {
              padding: 20px 16px;
            }
            .code {
              font-size: 32px;
              letter-spacing: 6px;
              padding: 10px 12px;
              white-space: nowrap;
              overflow-x: auto;
              display: block;
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
        <div style="display: none;">Your Bochi login code: ${code}</div>
        
        <div class="container">
          <div class="content">
            <div class="greeting">
              Hello!
            </div>
            <div class="message">
              ${messageText}
            </div>
            
            <div class="code-box">
              <div class="code-label">🔐 VERIFICATION CODE</div>
              <div class="code">${code}</div>
              <div class="expiry">⏰ This code expires in 10 minutes</div>
            </div>
            
            <div class="security-note">
              🔒 For your security, never share this code with anyone.
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 11px; color: #78350f; text-align: center;">
              If you didn't request this code, you can safely ignore this email.
            </p>
            
            <div class="website-link">
              <a href="https://www.bochi.ke">www.bochi.ke</a>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Bochi Construction Suite</strong></p>
            <p><a href="https://www.bochi.ke">🌐 www.bochi.ke</a></p>
            <p style="font-size: 10px; opacity: 0.7;">© ${new Date().getFullYear()} All rights reserved</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const info = await transporter.sendMail({
      from: `"Bochi" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@bochi.ke'}>`,
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





async function sendOTP(email, code, purpose = 'login') {
  try {
    const transporter = getTransporter();
    
    if (!transporter) {
      console.error('❌ Email transporter not configured');
      return { success: false, error: 'Email service not configured' };
    }
    
    let subject = '';
    let messageText = '';
    
    if (purpose === 'login') {
      subject = `Your Login Code - BOCHI`;
      messageText = 'Please use this code to log in to your account.';
    } else if (purpose === 'registration') {
      subject = `Verify Your Registration - BOCHI`;
      messageText = 'Please use this code to complete your registration.';
    } else if (purpose === 'invitation') {
      subject = `You've Been Invited - BOCHI`;
      messageText = 'Please use this code to complete your registration.';
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
        <title>${subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            background-color: #fef9f0;
            margin: 0;
            padding: 16px;
          }
          .container {
            max-width: 450px;
            width: 100%;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 35px -10px rgba(245, 158, 11, 0.15);
            border: 1px solid #fde68a;
          }
          .content {
            padding: 28px 20px;
            background: #ffffff;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
          }
          .message {
            color: #4b5563;
            font-size: 15px;
            margin-bottom: 25px;
            line-height: 1.5;
          }
          .code-box {
            background: linear-gradient(135deg, #fef3c7, #fffbeb);
            border: 2px solid #fbbf24;
            border-radius: 16px;
            padding: 20px 16px;
            text-align: center;
            margin: 20px 0;
          }
          .code-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #92400e;
            font-weight: 600;
            margin-bottom: 12px;
          }
          .code {
            font-size: 42px;
            font-weight: 800;
            font-family: 'Courier New', 'Monaco', monospace;
            letter-spacing: 8px;
            color: #b45309;
            background: white;
            padding: 12px 16px;
            border-radius: 12px;
            display: inline-block;
            border: 1px solid #fde68a;
            word-break: keep-all;
            white-space: nowrap;
          }
          .expiry {
            font-size: 11px;
            color: #78350f;
            margin-top: 12px;
          }
          .divider {
            margin: 25px 0 15px;
            border: none;
            height: 1px;
            background: linear-gradient(90deg, transparent, #fde68a, #f59e0b, #fde68a, transparent);
          }
          .footer {
            text-align: center;
            padding: 18px 20px;
            background: linear-gradient(135deg, #fef9f0, #fffbeb);
            border-top: 1px solid #fde68a;
          }
          .footer p {
            margin: 4px 0;
            font-size: 11px;
            color: #78350f;
          }
          .footer a {
            color: #d97706;
            text-decoration: none;
            font-weight: 600;
          }
          .security-note {
            background: #fef3c7;
            padding: 12px 14px;
            border-radius: 12px;
            font-size: 12px;
            color: #92400e;
            text-align: center;
            margin-top: 20px;
          }
          /* Mobile responsive fixes */
          @media only screen and (max-width: 480px) {
            .content {
              padding: 20px 16px;
            }
            .code {
              font-size: 32px;
              letter-spacing: 6px;
              padding: 10px 12px;
              white-space: nowrap;
              overflow-x: auto;
              display: block;
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="greeting">
              Hello!
            </div>
            <div class="message">
              ${messageText}
            </div>
            
            <div class="code-box">
              <div class="code-label">🔐 VERIFICATION CODE</div>
              <div class="code">${code}</div>
              <div class="expiry">⏰ This code expires in 10 minutes</div>
            </div>
            
            <div class="security-note">
              🔒 For your security, never share this code with anyone.
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 11px; color: #78350f; text-align: center;">
              If you didn't request this code, you can safely ignore this email.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>BOCHI Construction Suite</strong></p>
            <p><a href="https://bochi.ke">🌐 bochi.ke</a></p>
            <p style="font-size: 10px; opacity: 0.7;">© ${new Date().getFullYear()} All rights reserved</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const info = await transporter.sendMail({
      from: `"BOCHI" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@bochi.ke'}>`,
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