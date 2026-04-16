const { getDb } = require('../config/database');
const bcrypt = require('bcryptjs');

class CompanyController {
  static async registerCompany(req, res) {
    try {
      const db = getDb();
      const { name, subdomain, email, phone, address, kra_pin, admin_name, admin_email, admin_password } = req.body;
      
      // Check if subdomain already exists
      const existing = await db.get('SELECT * FROM companies WHERE subdomain = ?', [subdomain]);
      if (existing) {
        return res.status(400).json({ error: 'Subdomain already taken. Please choose another.' });
      }
      
      // Create company
      const result = await db.run(
        `INSERT INTO companies (name, subdomain, email, phone, address, kra_pin, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, subdomain, email, phone, address, kra_pin, new Date().toISOString()]
      );
      
      const companyId = result.lastID;
      
      // Create admin user for this company
      const hashedPassword = await bcrypt.hash(admin_password, 10);
      await db.run(
        `INSERT INTO users (company_id, name, email, password, role, permissions, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [companyId, admin_name, admin_email, hashedPassword, 'admin', JSON.stringify([]), new Date().toISOString()]
      );
      
      res.status(201).json({
        message: 'Company registered successfully',
        company: { id: companyId, name, subdomain }
      });
    } catch (error) {
      console.error('Register company error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  static async getCompanyInfo(req, res) {
    try {
      const db = getDb();
      const company = await db.get(
        'SELECT id, name, subdomain, email, phone, address, kra_pin, currency, currency_symbol, created_at FROM companies WHERE id = ?',
        [req.user.companyId]
      );
      res.json(company);
    } catch (error) {
      console.error('Get company error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  static async updateCompanyInfo(req, res) {
    try {
      const db = getDb();
      const { name, email, phone, address, kra_pin, currency, currency_symbol } = req.body;
      
      await db.run(
        `UPDATE companies SET name = ?, email = ?, phone = ?, address = ?, kra_pin = ?, currency = ?, currency_symbol = ?
         WHERE id = ?`,
        [name, email, phone, address, kra_pin, currency, currency_symbol, req.user.companyId]
      );
      
      const company = await db.get(
        'SELECT id, name, subdomain, email, phone, address, kra_pin, currency, currency_symbol FROM companies WHERE id = ?',
        [req.user.companyId]
      );
      res.json(company);
    } catch (error) {
      console.error('Update company error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = CompanyController;