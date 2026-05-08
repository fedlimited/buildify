const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    // Use environment variables with NovaHost cPanel defaults
    const host = process.env.EMAIL_HOST || 'mail.bochi.ke';
    const port = parseInt(process.env.EMAIL_PORT) || 465;
    const secure = process.env.EMAIL_SECURE === 'true';
    
    console.log(`📧 SMTP Config: ${host}:${port} (secure: ${secure})`);
    
    transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false  // Required for some cPanel servers
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
      from: `"Bochi Construction Suite" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your ${purpose} verification code - Bochi`,
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
            <h2>Bochi Construction Suite</h2>
            <p>Your verification code to ${purposeText} Bochi is:</p>
            <div class="code">${code}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr>
            <p style="font-size: 12px; color: #666;">Bochi Construction Suite - Project Management System</p>
          </div>
        </body>
        </html>
      `,
      text: `Bochi Construction Suite\n\nYour verification code to ${purposeText} BOCHI is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`
    });
    
    console.log(`✅ OTP email sent successfully to ${email}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${email}:`, error.message);
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
      from: `"${inviterName} via BOCHI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invitation to join ${companyName} on BOCHI`,
      html: `
        <h2>You're Invited!</h2>
        <p><strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong> on Bochi Construction Suite.</p>
        <p>Your invitation code: <strong style="font-size: 24px;">${code}</strong></p>
        <p>This code expires in 30 minutes.</p>
        <p>Click here to register: <a href="https://app.Bochi.ke/register">Register Now</a></p>
      `,
      text: `You're invited to join ${companyName} on Bochi.\n\nYour invitation code: ${code}\n\nExpires in 30 minutes.\n\nRegister at: https://app.bochi.ke/register`
    });
    
    console.log(`✅ Invitation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send invitation:`, error.message);
    return false;
  }
}

async function sendInvoiceEmail(email, payment) {
  const invoiceNumber = `INV-BOCHI-${String(payment.id).padStart(6, '0')}`;
  const invoiceDate = new Date(payment.paid_at || payment.created_at).toLocaleDateString('en-KE', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const amountKES = payment.amount_kes || 0;
  const usdAmount = payment.amount_usd || 0;
  const vatRate = 0.16;
  const vatAmount = amountKES * vatRate;
  const subtotal = amountKES - vatAmount;

  console.log('\n📄 ========================================');
  console.log(`📧 Sending invoice to: ${email}`);
  console.log(`🧾 Invoice #: ${invoiceNumber}`);
  console.log(`💰 Amount: KES ${amountKES.toLocaleString()}`);
  console.log('========================================\n');

  try {
    const transporter = getTransporter();
    
    await transporter.sendMail({
      from: `"Bochi Construction Suite" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invoice ${invoiceNumber} - Bochi Construction Suite`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: #1a1a1a; padding: 25px; text-align: center; }
            .header h1 { color: #f59e0b; margin: 0; font-size: 28px; }
            .header p { color: #888; margin: 5px 0 0 0; font-size: 13px; }
            .body { padding: 25px; }
            .body h2 { margin: 0 0 5px 0; color: #333; }
            .info-table { width: 100%; margin: 15px 0; }
            .info-table td { padding: 3px 0; font-size: 14px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { text-align: left; padding: 10px; background: #f9fafb; font-size: 11px; color: #666; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; }
            td { padding: 10px; font-size: 14px; border-bottom: 1px solid #e5e7eb; }
            .text-right { text-align: right; }
            .total-row td { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 12px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
            .paid-badge { display: inline-block; background: #d4edda; color: #155724; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BOCHI</h1>
              <p>Construction Suite</p>
            </div>
            <div class="body">
              <h2>Invoice #${invoiceNumber}</h2>
              <table class="info-table">
                <tr><td><strong>Date:</strong></td><td>${invoiceDate}</td></tr>
                <tr><td><strong>Status:</strong></td><td><span class="paid-badge">PAID</span></td></tr>
                <tr><td><strong>Payment Method:</strong></td><td style="text-transform: capitalize;">${payment.payment_method || 'N/A'}</td></tr>
                ${payment.mpesa_transaction_id ? `<tr><td><strong>M-Pesa Ref:</strong></td><td>${payment.mpesa_transaction_id}</td></tr>` : ''}
              </table>
              
              <div style="border: 1px solid #eee; padding: 12px; border-radius: 4px; margin: 15px 0;">
                <p style="margin: 0; font-weight: bold;">From:</p>
                <p style="margin: 3px 0; font-size: 14px;">Finite Element Designs Limited</p>
                <p style="margin: 2px 0; font-size: 13px; color: #555;">P.O. Box 197-00618 Ruaraka, Nairobi, Kenya</p>
                <p style="margin: 2px 0; font-size: 13px; color: #555;">KRA PIN: P051927399I</p>
                <p style="margin: 2px 0; font-size: 13px; color: #555;">Email: info@bochi.ke | Web: bochi.ke</p>
              </div>
              
              <table>
                <thead>
                  <tr><th>Description</th><th class="text-right">Amount (KES)</th></tr>
                </thead>
                <tbody>
                  <tr><td>Subscription Payment</td><td class="text-right">${subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td></tr>
                  <tr><td>VAT (16%)</td><td class="text-right">${vatAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td></tr>
                  <tr class="total-row"><td>Total</td><td class="text-right">KES ${amountKES.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td></tr>
                  ${usdAmount > 0 ? `<tr><td style="font-size: 12px; color: #888;">Equivalent (USD)</td><td class="text-right" style="font-size: 12px; color: #888;">$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>` : ''}
                </tbody>
              </table>
              
              <p style="margin-top: 20px; color: #555;">Thank you for your business!</p>
            </div>
            <div class="footer">
              <p>Bochi Construction Suite | info@bochi.ke | bochi.ke</p>
              <p>This is a computer-generated invoice.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: [
        `INVOICE ${invoiceNumber}`,
        `Date: ${invoiceDate}`,
        `Status: PAID`,
        ``,
        `From: Finite Element Designs Limited`,
        `P.O. Box 197-00618 Ruaraka, Nairobi, Kenya`,
        `KRA PIN: P051927399I`,
        ``,
        `Subtotal: KES ${subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`,
        `VAT (16%): KES ${vatAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`,
        `Total: KES ${amountKES.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`,
        ``,
        `Payment Method: ${payment.payment_method || 'N/A'}`,
        `${payment.mpesa_transaction_id ? `M-Pesa Ref: ${payment.mpesa_transaction_id}` : ''}`,
        ``,
        `Thank you for your business!`,
        `Bochi Construction Suite | info@bochi.ke | bochi.ke`
      ].filter(Boolean).join('\n')
    });
    
    console.log(`✅ Invoice email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send invoice email to ${email}:`, error.message);
    return false;
  }
}

async function verifyTransporter() {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log('✅ Email service is ready!');
    console.log(`📧 Sending from: ${process.env.EMAIL_USER}`);
    console.log(`🌐 SMTP Server: ${process.env.EMAIL_HOST || 'mail.bochi.ke'}:${process.env.EMAIL_PORT || 465}`);
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    console.log('📝 Continuing in fallback mode (OTP shown in console only)');
    console.log('💡 Check EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE in Render environment');
    return false;
  }
}

// Send bulk email to tenants - accepts raw HTML to prevent double wrapping
async function sendBulkEmail(email, subject, message, userName, companyName, htmlMessage = null) {
  // If htmlMessage is provided (from frontend), use it directly WITHOUT extra wrapping
  // This prevents the double-box effect and preserves your formatting
  const finalHtml = htmlMessage || `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          padding: 30px 20px;
          text-align: center;
        }
        .header-title {
          font-size: 28px;
          font-weight: bold;
          color: #ffffff;
        }
        .tagline {
          font-size: 13px;
          color: rgba(255,255,255,0.9);
          margin-top: 5px;
        }
        .content {
          padding: 30px;
          background-color: #ffffff;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .paragraph {
          font-size: 16px;
          color: #374151;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer-text {
          font-size: 12px;
          color: #9ca3af;
        }
        @media (max-width: 600px) {
          .content {
            padding: 20px;
          }
          .paragraph {
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 20px 10px; background-color: #f5f5f5;">
      <div class="email-container">
        <div class="header">
          <div class="header-title">BOCHI</div>
          <div class="tagline">Construction Suite</div>
        </div>
        <div class="content">
          <div class="greeting">Dear ${userName},</div>
          <div class="paragraph">${message.replace(/\n/g, '<br>')}</div>
        </div>
        <div class="footer">
          <div class="footer-text">© ${new Date().getFullYear()} Bochi Construction Suite</div>
          <div class="footer-text" style="margin-top: 5px;">This is an automated message from Bochi Admin. Please do not reply.</div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // Extract plain text from HTML for text version
  const plainText = message.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
  
  const text = `Dear ${userName},\n\n${plainText}\n\n---\nBochi Construction Suite\ninfo@bochi.ke | bochi.ke`;
  
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Bochi Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: finalHtml,
      text: text
    });
    console.log(`✅ Bulk email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send bulk email to ${email}:`, error.message);
    throw error;
  }
}

// Send stakeholder invitation email
async function sendStakeholderInvitation(email, name, tempPassword, projectName, stakeholderType, inviterName) {
  const stakeholderLabels = {
    client: 'Client/Owner',
    consultant: 'Consultant',
    architect: 'Architect',
    structural_engineer: 'Structural Engineer',
    electrical_engineer: 'Electrical Engineer',
    mechanical_engineer: 'Mechanical Engineer',
    quantity_surveyor: 'Quantity Surveyor',
    project_manager: 'Project Manager'
  };
  
  const displayType = stakeholderLabels[stakeholderType] || stakeholderType;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; color: white; border-radius: 12px 12px 0 0; }
        .content { padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .temp-password { font-size: 24px; font-weight: bold; font-family: monospace; background: #f3f4f6; padding: 10px; text-align: center; letter-spacing: 2px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>BOCHI Construction Suite</h2>
          <p>You've been invited to collaborate!</p>
        </div>
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          <p><strong>${inviterName}</strong> has invited you to join <strong>${projectName}</strong> as a <strong>${displayType}</strong>.</p>
          <p>Your temporary login credentials:</p>
          <div class="temp-password">${tempPassword}</div>
          <p style="text-align: center;">
            <a href="https://bochi.ke/login" class="button">Login to Your Portal</a>
          </p>
          <p><strong>Important:</strong> Upon first login, you will be prompted to change your password.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">You will only have access to information related to this specific project.</p>
        </div>
        <div class="footer">
          <p>BOCHI Construction Suite | <a href="https://bochi.ke">bochi.ke</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `Dear ${name},\n\n${inviterName} has invited you to join ${projectName} as a ${displayType}.\n\nYour temporary password is: ${tempPassword}\n\nLogin at: https://bochi.ke/login\n\nUpon first login, you will be prompted to change your password.\n\n---\nBOCHI Construction Suite`;
  
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Bochi Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invitation to collaborate on ${projectName}`,
      html: html,
      text: text
    });
    console.log(`✅ Stakeholder invitation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send stakeholder invitation to ${email}:`, error.message);
    throw error;
  }
}

module.exports = { 
  sendOTP, 
  sendInvitationCode, 
  sendInvoiceEmail, 
  verifyTransporter, 
  sendBulkEmail, 
  sendStakeholderInvitation 
};