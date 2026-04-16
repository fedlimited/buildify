const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'bochaberi_super_secret_key';

async function login(req, res) {
  try {
    const { email, password, subdomain } = req.body;
    const db = getDb();

    // Find company by subdomain
    const company = await db.get('SELECT * FROM companies WHERE subdomain = ? AND is_active = 1', [subdomain]);
    if (!company) {
      return res.status(401).json({ error: 'Invalid company domain' });
    }

    // Find user in this company
    const user = await db.get(
      'SELECT * FROM users WHERE email = ? AND company_id = ? AND is_active = 1',
      [email, company.id]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        permissions: JSON.parse(user.permissions || '[]'),
        companyId: company.id,
        subdomain: company.subdomain
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: JSON.parse(user.permissions || '[]'),
        company: {
          id: company.id,
          name: company.name,
          subdomain: company.subdomain
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCurrentUser(req, res) {
  try {
    const db = getDb();
    const user = await db.get(
      'SELECT u.id, u.name, u.email, u.role, u.permissions, c.id as company_id, c.name as company_name, c.subdomain FROM users u JOIN companies c ON u.company_id = c.id WHERE u.id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: JSON.parse(user.permissions || '[]'),
      company: {
        id: user.company_id,
        name: user.company_name,
        subdomain: user.subdomain
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { login, getCurrentUser };