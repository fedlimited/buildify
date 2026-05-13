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
      
      // Create company with RETURNING id for PostgreSQL
      const result = await db.run(
        `INSERT INTO companies (name, subdomain, email, phone, address, kra_pin, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        [name, subdomain, email, phone, address, kra_pin, new Date().toISOString()]
      );
      
      const companyId = result.lastID;
      
      // Create company_settings record with default values
      await db.run(
        `INSERT INTO company_settings (company_id, name, address, kra_pin, currency, currency_symbol)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [companyId, name, address, kra_pin, 'KES', 'KSh']
      );
      
      // Create admin user for this company
      const hashedPassword = await bcrypt.hash(admin_password, 10);
      await db.run(
        `INSERT INTO users (company_id, name, email, password, role, permissions, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [companyId, admin_name, admin_email, hashedPassword, 'admin', JSON.stringify([]), new Date().toISOString()]
      );
      
      // ========== GIVE 14-DAY PRO TRIAL ==========
      // Get the Pro plan ID
      const proPlan = await db.get('SELECT id FROM subscription_plans WHERE name = ?', ['pro']);
      
      if (proPlan) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 14); // 14 days trial
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        await db.run(
          `INSERT INTO company_subscriptions 
           (company_id, plan_id, status, start_date, end_date, trial_end_date, created_at, updated_at)
           VALUES (?, ?, 'trial', ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [companyId, proPlan.id, startDateStr, endDateStr, endDateStr]
        );
        
        console.log(`✅ Created 14-day Pro trial for company ${companyId} (${name})`);
      } else {
        console.warn(`⚠️ Pro plan not found in subscription_plans table. Trial not created for company ${companyId}`);
      }
      
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
      const companyId = req.user.companyId;
      
      // Join companies with company_settings to get ALL fields including banking
      const result = await db.get(
        `SELECT 
          c.id, c.name, c.subdomain, c.email, c.phone, c.address as company_address,
          cs.address, cs.kra_pin as "kraPin", 
          cs.logo_url as "logoUrl",
          cs.currency, cs.currency_symbol as "currencySymbol",
          cs.bank_name, cs.bank_account_number, cs.bank_branch, 
          cs.bank_swift_code, cs.mpesa_paybill, cs.mpesa_account_number,
          cs.facebook, cs.twitter, cs.linkedin, cs.instagram,
          cs.vat_registration_number as "vatRegistrationNumber",
          cs.website, cs.vat_rate, cs.fiscal_year_start,
          cs.decimal_places, cs.thousand_separator, cs.decimal_separator
        FROM companies c
        LEFT JOIN company_settings cs ON c.id = cs.company_id
        WHERE c.id = ?`,
        [companyId]
      );
      
      // If no company_settings record exists, create one
      if (!result?.address && result?.id) {
        await db.run(
          `INSERT INTO company_settings (company_id, name, address, kra_pin, currency, currency_symbol)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [companyId, result.name, result.company_address || '', result.kraPin || '', 'KES', 'KSh']
        );
        
        // Fetch again after insert
        const updatedResult = await db.get(
          `SELECT 
            c.id, c.name, c.subdomain, c.email, c.phone,
            cs.address, cs.kra_pin as "kraPin", 
            cs.logo_url as "logoUrl",
            cs.currency, cs.currency_symbol as "currencySymbol",
            cs.bank_name, cs.bank_account_number, cs.bank_branch, 
            cs.bank_swift_code, cs.mpesa_paybill, cs.mpesa_account_number,
            cs.facebook, cs.twitter, cs.linkedin, cs.instagram,
            cs.vat_registration_number as "vatRegistrationNumber",
            cs.website, cs.vat_rate, cs.fiscal_year_start
          FROM companies c
          LEFT JOIN company_settings cs ON c.id = cs.company_id
          WHERE c.id = ?`,
          [companyId]
        );
        return res.json(updatedResult);
      }
      
      res.json(result);
    } catch (error) {
      console.error('Get company error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  static async updateCompanyInfo(req, res) {
    try {
      const db = getDb();
      const companyId = req.user.companyId;
      
      const {
        name, email, phone,
        address, kraPin, logoUrl,
        currency, currencySymbol,
        website, vatRegistrationNumber,
        bank_name, bank_account_number, bank_branch, bank_swift_code,
        mpesa_paybill, mpesa_account_number,
        facebook, twitter, linkedin, instagram,
        vat_rate, fiscal_year_start,
        decimal_places, thousand_separator, decimal_separator
      } = req.body;
      
      // Update companies table
      await db.run(
        `UPDATE companies SET name = ?, email = ?, phone = ? WHERE id = ?`,
        [name, email, phone, companyId]
      );
      
      // Update or insert into company_settings
      const existingSettings = await db.get('SELECT id FROM company_settings WHERE company_id = ?', [companyId]);
      
      if (existingSettings) {
        await db.run(
          `UPDATE company_settings SET
            address = ?, kra_pin = ?, logo_url = ?,
            currency = ?, currency_symbol = ?,
            website = ?, vat_registration_number = ?,
            bank_name = ?, bank_account_number = ?, bank_branch = ?, bank_swift_code = ?,
            mpesa_paybill = ?, mpesa_account_number = ?,
            facebook = ?, twitter = ?, linkedin = ?, instagram = ?,
            vat_rate = ?, fiscal_year_start = ?,
            decimal_places = ?, thousand_separator = ?, decimal_separator = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE company_id = ?`,
          [address, kraPin, logoUrl, currency, currencySymbol,
           website, vatRegistrationNumber,
           bank_name, bank_account_number, bank_branch, bank_swift_code,
           mpesa_paybill, mpesa_account_number,
           facebook, twitter, linkedin, instagram,
           vat_rate || 16, fiscal_year_start || 'January',
           decimal_places || 2, thousand_separator || ',', decimal_separator || '.',
           companyId]
        );
      } else {
        await db.run(
          `INSERT INTO company_settings (
            company_id, address, kra_pin, logo_url, currency, currency_symbol,
            website, vat_registration_number,
            bank_name, bank_account_number, bank_branch, bank_swift_code,
            mpesa_paybill, mpesa_account_number,
            facebook, twitter, linkedin, instagram,
            vat_rate, fiscal_year_start,
            decimal_places, thousand_separator, decimal_separator
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [companyId, address, kraPin, logoUrl, currency, currencySymbol,
           website, vatRegistrationNumber,
           bank_name, bank_account_number, bank_branch, bank_swift_code,
           mpesa_paybill, mpesa_account_number,
           facebook, twitter, linkedin, instagram,
           vat_rate || 16, fiscal_year_start || 'January',
           decimal_places || 2, thousand_separator || ',', decimal_separator || '.']
        );
      }
      
      // Fetch and return updated company info
      const updatedCompany = await db.get(
        `SELECT 
          c.id, c.name, c.subdomain, c.email, c.phone,
          cs.address, cs.kra_pin as "kraPin", 
          cs.logo_url as "logoUrl",
          cs.currency, cs.currency_symbol as "currencySymbol",
          cs.bank_name, cs.bank_account_number, cs.bank_branch, 
          cs.bank_swift_code, cs.mpesa_paybill, cs.mpesa_account_number,
          cs.facebook, cs.twitter, cs.linkedin, cs.instagram,
          cs.vat_registration_number as "vatRegistrationNumber",
          cs.website, cs.vat_rate, cs.fiscal_year_start,
          cs.decimal_places, cs.thousand_separator, cs.decimal_separator
        FROM companies c
        LEFT JOIN company_settings cs ON c.id = cs.company_id
        WHERE c.id = ?`,
        [companyId]
      );
      
      res.json(updatedCompany);
    } catch (error) {
      console.error('Update company error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = CompanyController;