const jwt = require('jsonwebtoken');
const { getDb } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'bochaberi_super_secret_key';



















async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('=== AUTH DEBUG ===');
    console.log('Decoded token:', decoded);
    console.log('User ID from token:', decoded.userId || decoded.id);
    
    // Get user with company info
    const db = await getDb();  // Add await here
    const user = await db.get(
      `SELECT u.*, c.id as company_id, c.name as company_name, c.subdomain
       FROM users u
       JOIN companies c ON u.company_id = c.id
       WHERE u.id = ? AND u.is_active = 1`,
      [decoded.userId || decoded.id]
    );

    console.log('User found in DB:', user ? `Yes (${user.email}, is_active: ${user.is_active})` : 'No');

    if (!user) {
      return res.status(401).json({ error: 'User not found or inactive.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: JSON.parse(user.permissions || '[]'),
      companyId: user.company_id,
      company_id: user.company_id,
      companyName: user.company_name,
      subdomain: user.subdomain
    };

    console.log('Auth successful for:', user.email);
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}


























function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

function requireCompanyAccess(req, res, next) {
  // All queries will automatically filter by company_id
  // This middleware ensures the user has company context
  if (!req.user.companyId) {
    return res.status(403).json({ error: 'Company context missing.' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, requireCompanyAccess };