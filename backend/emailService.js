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

async function sendBulkEmail(recipients, subject, message) {
  let successCount = 0;
  let failCount = 0;
  for (const email of recipients) {
    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"Bochi Construction Suite" <${process.env.EMAIL_USER || 'noreply@bochi.ke'}>`,
        to: email,
        subject: subject,
        html: message
      });
      successCount++;
    } catch (error) {
      console.error(`Failed to send to ${email}:`, error.message);
      failCount++;
    }
  }
  return { successCount, failCount };
}

async function sendEmail(to, subject, html) {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Bochi Construction Suite" <${process.env.EMAIL_USER || 'noreply@bochi.ke'}>`,
      to: to,
      subject: subject,
      html: html
    });
    return { success: true };
  } catch (error) {
    console.error('Send email error:', error);
    return { success: false, error: error.message };
  }
}

// ========== DOCUMENT NOTIFICATION ==========
async function sendDocumentNotification({ to, stakeholder_name, project_name, document, action, uploaded_by, revision_notes }) {
    try {
        const transporter = getTransporter();
        const actionText = action === 'upload' ? 'uploaded' : 'updated';
        const subject = `[${project_name}] New Document ${actionText}: ${document.title}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #1a365d;">Bochi Construction Suite</h2>
                <p>Dear ${stakeholder_name},</p>
                <p><strong>${uploaded_by}</strong> has ${actionText} a new document for <strong>${project_name}</strong>.</p>
                <div style="background: #f5f5f5; padding: 15px; margin: 15px 0;">
                    <p><strong>Title:</strong> ${document.title}</p>
                    <p><strong>Category:</strong> ${document.category}</p>
                    <p><strong>Version:</strong> ${document.version}</p>
                </div>
                <hr>
                <p style="font-size: 12px; color: #666;">Bochi Construction Suite</p>
            </div>
        `;
        await transporter.sendMail({
            from: `"Bochi Construction Suite" <${process.env.EMAIL_USER || 'noreply@bochi.ke'}>`,
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

// ========== TASK ASSIGNMENT ==========
async function sendTaskAssignment({ to, assignee_name, assigner_name, project_name, minutes_title, task, due_date, priority, action_item_id }) {
    try {
        const transporter = getTransporter();
        const subject = `[Action Required] New Task Assigned: ${project_name}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #1a365d;">Bochi Construction Suite</h2>
                <p>Dear ${assignee_name},</p>
                <p><strong>${assigner_name}</strong> has assigned you a task for <strong>${project_name}</strong>.</p>
                <div style="background: #f5f5f5; padding: 15px; margin: 15px 0;">
                    <p><strong>Task:</strong> ${task}</p>
                    <p><strong>Due Date:</strong> ${new Date(due_date).toLocaleDateString()}</p>
                    <p><strong>Priority:</strong> ${priority.toUpperCase()}</p>
                </div>
                <hr>
                <p style="font-size: 12px; color: #666;">Bochi Construction Suite</p>
            </div>
        `;
        await transporter.sendMail({
            from: `"Bochi Construction Suite" <${process.env.EMAIL_USER || 'noreply@bochi.ke'}>`,
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

// ========== TASK REMINDER ==========
async function sendTaskReminder({ to, assignee_name, task, due_date, priority, project_name, minutes_title, action_item_id }) {
    try {
        const transporter = getTransporter();
        const daysLeft = Math.ceil((new Date(due_date) - new Date()) / (1000 * 60 * 60 * 24));
        const urgency = daysLeft <= 1 ? 'URGENT' : 'Reminder';
        const subject = `[${urgency}] Task Reminder: ${project_name}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #1a365d;">Bochi Construction Suite</h2>
                <p>Dear ${assignee_name},</p>
                <p>This is a reminder for your task:</p>
                <div style="background: #f5f5f5; padding: 15px; margin: 15px 0;">
                    <p><strong>Task:</strong> ${task}</p>
                    <p><strong>Due Date:</strong> ${new Date(due_date).toLocaleDateString()}</p>
                    <p><strong>Days Remaining:</strong> ${daysLeft}</p>
                </div>
                <hr>
                <p style="font-size: 12px; color: #666;">Bochi Construction Suite</p>
            </div>
        `;
        await transporter.sendMail({
            from: `"Bochi Construction Suite" <${process.env.EMAIL_USER || 'noreply@bochi.ke'}>`,
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

// ========== APPROVAL REQUEST ==========
async function sendApprovalRequest({ to, name, minutesTitle, minutesId, frontendUrl }) {
    try {
        const transporter = getTransporter();
        const subject = `[Action Required] Please review meeting minutes: ${minutesTitle}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #1a365d;">Bochi Construction Suite</h2>
                <p>Dear ${name},</p>
                <p>The minutes for <strong>${minutesTitle}</strong> are ready for your review.</p>
                <p><a href="${frontendUrl || process.env.FRONTEND_URL}/stakeholder/minutes/${minutesId}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Minutes</a></p>
                <hr>
                <p style="font-size: 12px; color: #666;">Bochi Construction Suite</p>
            </div>
        `;
        await transporter.sendMail({
            from: `"Bochi Construction Suite" <${process.env.EMAIL_USER || 'noreply@bochi.ke'}>`,
            to: to,
            subject: subject,
            html: html
        });
        return true;
    } catch (error) {
        console.error('Approval request error:', error);
        return false;
    }
}

// ========== MINUTES REJECTION ==========
async function sendMinutesRejection({ to, name, minutesTitle, feedback, minutesId }) {
    try {
        const transporter = getTransporter();
        const subject = `Meeting Minutes Need Revision: ${minutesTitle}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #1a365d;">Bochi Construction Suite</h2>
                <p>Dear ${name},</p>
                <p>The minutes for <strong>${minutesTitle}</strong> were not approved and need revision.</p>
                ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
                <hr>
                <p style="font-size: 12px; color: #666;">Bochi Construction Suite</p>
            </div>
        `;
        await transporter.sendMail({
            from: `"Bochi Construction Suite" <${process.env.EMAIL_USER || 'noreply@bochi.ke'}>`,
            to: to,
            subject: subject,
            html: html
        });
        return true;
    } catch (error) {
        console.error('Rejection error:', error);
        return false;
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

// ========== APOLOGY REQUEST EMAIL ==========
async function sendApologyRequest({ to, name, meetingTitle, meetingDate, minutesId }) {
    try {
        const transporter = getTransporter();
        const subject = `Apology Request: ${meetingTitle}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #1a365d;">Bochi Construction Suite</h2>
                <p>Dear ${name},</p>
                <p>You were marked as <strong>absent</strong> for the meeting:</p>
                <div style="background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
                    <p><strong>Meeting:</strong> ${meetingTitle}</p>
                    <p><strong>Date:</strong> ${new Date(meetingDate).toLocaleDateString()}</p>
                </div>
                <p>Please provide an apology or explanation for your absence by clicking the button below:</p>
                <p style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/stakeholder/minutes/${minutesId}/apology" 
                       style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Submit Apology
                    </a>
                </p>
                <p>If you believe this is an error, please contact the meeting chairperson.</p>
                <hr>
                <p style="font-size: 12px; color: #666;">Bochi Construction Suite - Construction Management System</p>
            </div>
        `;
        
        await transporter.sendMail({
            from: `"Bochi Construction Suite" <${process.env.EMAIL_USER || 'noreply@bochi.ke'}>`,
            to: to,
            subject: subject,
            html: html
        });
        console.log(`✅ Apology request sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Apology request error:', error);
        return false;
    }
}

// ========== CALENDAR INVITE ==========
async function sendCalendarInvite({ to, name, meetingTitle, meetingDate, location, minutesId }) {
    try {
        const transporter = getTransporter();
        
        const startDate = new Date(meetingDate);
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 2);
        
        const formatICSDate = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };
        
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Bochi Construction Suite//Meeting Calendar//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${minutesId}-${Date.now()}@bochi.ke
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${meetingTitle}
DESCRIPTION:Meeting minutes and action items will be available in the stakeholder portal.
LOCATION:${location || 'Virtual Meeting'}
ORGANIZER:mailto:${process.env.EMAIL_USER}
ATTENDEE;CN=${name};RSVP=TRUE:mailto:${to}
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:Reminder: ${meetingTitle} tomorrow
END:VALARM
END:VEVENT
END:VCALENDAR`;
        
        await transporter.sendMail({
            from: `"Bochi Construction Suite" <${process.env.EMAIL_USER || 'noreply@bochi.ke'}>`,
            to: to,
            subject: `Calendar Invite: ${meetingTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #1a365d;">Meeting Calendar Invite</h2>
                    <p>Dear ${name},</p>
                    <p>You have been invited to the meeting:</p>
                    <div style="background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
                        <p><strong>Meeting:</strong> ${meetingTitle}</p>
                        <p><strong>Date:</strong> ${new Date(meetingDate).toLocaleDateString()}</p>
                        ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
                    </div>
                    <p>You can add this meeting to your calendar by downloading the attached .ics file.</p>
                    <hr>
                    <p style="font-size: 12px; color: #666;">Bochi Construction Suite - Construction Management System</p>
                </div>
            `,
            attachments: [
                {
                    filename: `${meetingTitle.replace(/[^a-z0-9]/gi, '_')}.ics`,
                    content: icsContent,
                    contentType: 'text/calendar'
                }
            ]
        });
        
        console.log(`✅ Calendar invite sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Calendar invite error:', error);
        return false;
    }
}



module.exports = { 
    sendOTP, 
    sendInvitationCode, 
    sendStakeholderInvitation,
    sendBulkEmail,
    sendEmail,
    sendDocumentNotification,
    sendTaskAssignment,
    sendTaskReminder,
    sendApprovalRequest,
    sendMinutesRejection,
    sendApologyRequest,
    sendCalendarInvite,
    verifyTransporter
};