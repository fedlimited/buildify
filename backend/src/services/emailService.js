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
      from: `"BOCHI Construction Suite" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your ${purpose} verification code - BOCHI`,
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
            <h2>BOCHI Construction Suite</h2>
            <p>Your verification code to ${purposeText} BOCHI is:</p>
            <div class="code">${code}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr>
            <p style="font-size: 12px; color: #666;">BOCHI Construction Suite - Project Management System</p>
          </div>
        </body>
        </html>
      `,
      text: `BOCHI Construction Suite\n\nYour verification code to ${purposeText} BOCHI is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`
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
      from: `"${inviterName} via BOCHI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invitation to join ${companyName} on BOCHI`,
      html: `
        <h2>You're Invited!</h2>
        <p><strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong> on BOCHI Construction Suite.</p>
        <p>Your invitation code: <strong style="font-size: 24px;">${code}</strong></p>
        <p>This code expires in 30 minutes.</p>
        <p>Click here to register: <a href="https://app.bochi.ke/register">Register Now</a></p>
      `,
      text: `You're invited to join ${companyName} on BOCHI.\n\nYour invitation code: ${code}\n\nExpires in 30 minutes.\n\nRegister at: https://app.bochi.ke/register`
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
      from: `"BOCHI Construction Suite" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invoice ${invoiceNumber} - BOCHI Construction Suite`,
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
                  <tr>
                    <th>Description</th>
                    <th class="text-right">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Subscription Payment</td>
                    <td class="text-right">${subtotal.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td>VAT (16%)</td>
                    <td class="text-right">${vatAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr class="total-row">
                    <td>Total</td>
                    <td class="text-right">KES ${amountKES.toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  ${usdAmount > 0 ? `<tr><td style="font-size: 12px; color: #888;">Equivalent (USD)</td><td class="text-right" style="font-size: 12px; color: #888;">$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>` : ''}
                </tbody>
              </table>
              
              <p style="margin-top: 20px; color: #555;">Thank you for your business!</p>
            </div>
            <div class="footer">
              <p>BOCHI Construction Suite | info@bochi.ke | bochi.ke</p>
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
        `BOCHI Construction Suite | info@bochi.ke | bochi.ke`
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
    console.log('✅ Email service is ready (Gmail)');
    console.log(`📧 Sending from: ${process.env.EMAIL_USER}`);
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    console.log('📝 Continuing in fallback mode (OTP shown in console only)');
    return false;
  }
}

module.exports = { sendOTP, sendInvitationCode, sendInvoiceEmail, verifyTransporter };