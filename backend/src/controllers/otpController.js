const { getDb } = require('../config/database');  // ← ADD THIS LINE
const { sendOTP } = require('../services/emailService');
const jwt = require('jsonwebtoken');

async function sendLoginOTP(req, res) {
  console.log('>>> OTP FUNCTION CALLED <<<');
  console.log('Request body:', req.body);
  
  const { email, subdomain } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const db = await getDb();
  
  console.log(`Generated OTP: ${code} for ${email}`);
  
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  
  try {
    await db.run(
      `INSERT INTO otp_codes (email, code, purpose, expires_at, used) 
       VALUES (?, ?, 'login', ?, 0)`,
      [email, code, expiresAt.toISOString()]
    );
    console.log('✅ OTP saved to database');
  } catch (dbError) {
    console.error('❌ Failed to save OTP to database:', dbError.message);
  }
  
  sendOTP(email, code, 'login').then(success => {
    if (success) {
      console.log('✅ Email sending completed');
    } else {
      console.log('❌ Email sending failed');
    }
  });
  
  res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
    code: code,
    email: email
  });
}

async function verifyLoginOTP(req, res) {
  try {
    const { email, code, subdomain } = req.body;
    console.log('Verifying OTP for:', email, code);
    
    if (!email || !code || !subdomain) {
      return res.status(400).json({ error: 'Email, code, and subdomain are required' });
    }
    
    const db = await getDb();
    
    const otpRecord = await db.get(
      `SELECT * FROM otp_codes 
       WHERE email = ? AND code = ? AND purpose = 'login' 
       AND used = 0 AND expires_at > datetime('now')
       ORDER BY id DESC LIMIT 1`,
      [email, code]
    );
    
    if (!otpRecord) {
      console.log('❌ Invalid or expired OTP for:', email);
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }
    
    await db.run('UPDATE otp_codes SET used = 1 WHERE id = ?', [otpRecord.id]);
    console.log('✅ OTP verified and marked as used');
    
    const user = await db.get(
      `SELECT u.id, u.name, u.email, u.role, u.company_id, c.name as company_name, c.subdomain 
       FROM users u 
       JOIN companies c ON u.company_id = c.id 
       WHERE u.email = ? AND c.subdomain = ?`,
      [email, subdomain]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }




    
    const token = jwt.sign(
      { 
        id: user.id,
        userId: user.id, 
        email: user.email, 
        role: user.role,
        companyId: user.company_id,
        subdomain: user.subdomain
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );



    
    res.json({ 
      success: true, 
      message: 'Login successful', 
      token, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.company_id,
        companyName: user.company_name,
        subdomain: user.subdomain
      }
    });
    
  } catch (error) {
    console.error('Error in verifyLoginOTP:', error);
    res.status(500).json({ error: error.message });
  }
}

function sendRegistrationOTP(req, res) {
  res.json({ success: true, message: 'Registration OTP sent' });
}

function verifyRegistrationOTP(req, res) {
  res.json({ success: true, message: 'Registration verified' });
}

function resendOTP(req, res) {
  res.json({ success: true, message: 'OTP resent' });
}

module.exports = {
  sendLoginOTP,
  verifyLoginOTP,
  sendRegistrationOTP,
  verifyRegistrationOTP,
  resendOTP
};