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


// ========== DOCUMENT NOTIFICATION EMAIL ==========
async function sendDocumentNotification({ to, stakeholder_name, project_name, document, action, uploaded_by, revision_notes }) {
    try {
        const transporter = getTransporter();
        const actionText = action === 'upload' ? 'uploaded' : 'updated';
        const subject = `[${project_name}] New Document ${actionText}: ${document.title}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
                    .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .document-details { background: white; padding: 15px; border-left: 4px solid #4F46E5; margin: 15px 0; }
                    .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
                    .footer { font-size: 12px; color: #6b7280; text-align: center; margin-top: 30px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Document Notification</h2>
                    </div>
                    <div class="content">
                        <p>Dear ${stakeholder_name},</p>
                        <p><strong>${uploaded_by}</strong> has ${actionText} a new document for project <strong>${project_name}</strong>:</p>
                        
                        <div class="document-details">
                            <p><strong>Title:</strong> ${document.title}</p>
                            <p><strong>Category:</strong> ${document.category}</p>
                            <p><strong>Version:</strong> ${document.version}</p>
                            ${document.description ? `<p><strong>Description:</strong> ${document.description}</p>` : ''}
                            ${revision_notes ? `<p><strong>Revision Notes:</strong> ${revision_notes}</p>` : ''}
                        </div>
                        
                        <p style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'https://your-app.com'}/stakeholder/projects/${document.project_id}/documents" class="button">
                                View Document
                            </a>
                        </p>
                        
                        <hr>
                        <p><small>Direct link: <a href="${document.file_url}">${document.file_name || 'Download File'}</a></small></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated notification from BOCHABERI Construction Suite.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        await transporter.sendMail({
            from: `"${process.env.BREVO_SENDER_NAME || 'BOCHABERI'}" <${process.env.BREVO_SENDER_EMAIL || 'noreply@bochaberi.com'}>`,
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
        const priorityColors = {
            low: '#28a745',
            medium: '#ffc107',
            high: '#fd7e14',
            urgent: '#dc3545'
        };
        const color = priorityColors[priority] || '#ffc107';
        
        const subject = `[Action Required] New Task Assigned: ${project_name}`;
        const formattedDueDate = new Date(due_date).toLocaleDateString();
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
                    .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .task-details { background: white; padding: 15px; border-left: 4px solid ${color}; margin: 15px 0; }
                    .priority { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background: ${color}; color: white; }
                    .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
                    .footer { font-size: 12px; color: #6b7280; text-align: center; margin-top: 30px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>New Task Assignment</h2>
                    </div>
                    <div class="content">
                        <p>Dear ${assignee_name},</p>
                        <p><strong>${assigner_name}</strong> has assigned you a task:</p>
                        
                        <div class="task-details">
                            <p><strong>Project:</strong> ${project_name}</p>
                            ${minutes_title ? `<p><strong>Meeting:</strong> ${minutes_title}</p>` : ''}
                            <p><strong>Task:</strong> ${task}</p>
                            <p><strong>Due Date:</strong> ${formattedDueDate}</p>
                            <p><strong>Priority:</strong> <span class="priority">${priority.toUpperCase()}</span></p>
                        </div>
                        
                        <p style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'https://your-app.com'}/stakeholder/tasks/${action_item_id}" class="button">
                                View & Complete Task
                            </a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>Please update the task status once completed.</p>
                        <p>This is an automated notification from BOCHABERI Construction Suite.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        await transporter.sendMail({
            from: `"${process.env.BREVO_SENDER_NAME || 'BOCHABERI'}" <${process.env.BREVO_SENDER_EMAIL || 'noreply@bochaberi.com'}>`,
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
        const daysUntilDue = Math.ceil((new Date(due_date) - new Date()) / (1000 * 60 * 60 * 24));
        const isUrgent = daysUntilDue <= 1;
        const urgency = isUrgent ? 'URGENT' : 'Reminder';
        
        const priorityColors = {
            low: '#28a745',
            medium: '#ffc107',
            high: '#fd7e14',
            urgent: '#dc3545'
        };
        const color = priorityColors[priority] || '#ffc107';
        const formattedDueDate = new Date(due_date).toLocaleDateString();
        
        const subject = `[${urgency}] Task Reminder: ${project_name}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: ${isUrgent ? '#dc3545' : '#4F46E5'}; color: white; padding: 20px; text-align: center; }
                    .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .task-details { background: white; padding: 15px; border-left: 4px solid ${color}; margin: 15px 0; }
                    .priority { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background: ${color}; color: white; }
                    .button { background: ${isUrgent ? '#dc3545' : '#4F46E5'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
                    .footer { font-size: 12px; color: #6b7280; text-align: center; margin-top: 30px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>${urgency}: Task Due Soon</h2>
                    </div>
                    <div class="content">
                        <p>Dear ${assignee_name},</p>
                        <p>This is a reminder for your assigned task:</p>
                        
                        <div class="task-details">
                            <p><strong>Project:</strong> ${project_name}</p>
                            ${minutes_title ? `<p><strong>Meeting:</strong> ${minutes_title}</p>` : ''}
                            <p><strong>Task:</strong> ${task}</p>
                            <p><strong>Due Date:</strong> ${formattedDueDate} ${isUrgent ? '<span style="color: red;"> (Due soon!)</span>' : ''}</p>
                            <p><strong>Days Remaining:</strong> ${daysUntilDue}</p>
                            <p><strong>Priority:</strong> <span class="priority">${priority.toUpperCase()}</span></p>
                        </div>
                        
                        <p style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'https://your-app.com'}/stakeholder/tasks/${action_item_id}" class="button">
                                Complete Task Now
                            </a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>Please complete this task by the due date.</p>
                        <p>This is an automated reminder from BOCHABERI Construction Suite.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        await transporter.sendMail({
            from: `"${process.env.BREVO_SENDER_NAME || 'BOCHABERI'}" <${process.env.BREVO_SENDER_EMAIL || 'noreply@bochaberi.com'}>`,
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


// ========== VERIFY TRANSPORTER ==========
async function verifyTransporter() {
    try {
        const transporter = getTransporter();
        await transporter.verify();
        console.log('✅ Email transporter verified successfully');
        return true;
    } catch (error) {
        console.error('❌ Email transporter verification failed:', error.message);
        return false;
    }
}



module.exports = { sendOTP, sendInvitationCode, sendDocumentNotification, sendTaskAssignment, sendTaskReminder, verifyTransporter };