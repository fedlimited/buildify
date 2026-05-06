const { getDb } = require('../config/database');

const SettingsController = {
  // Get company settings
  getSettings: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;

      console.log('Fetching settings for company:', company_id);

      let settings = await db.get(
        'SELECT * FROM company_settings WHERE company_id = ? LIMIT 1',
        [company_id]
      );

      if (!settings) {
        // Create default settings for this company
        const result = await db.run(
          `INSERT INTO company_settings (
            company_id, name, currency, currency_symbol, created_at, updated_at
          ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [company_id, 'My Company', 'KES', 'KSh']
        );

        settings = await db.get(
          'SELECT * FROM company_settings WHERE id = ?',
          [result.lastID]
        );
      }

      res.json(settings);
    } catch (error) {
      console.error('Error in getSettings:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update company settings - COMPLETE VERSION
  updateSettings: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      const {
        // Basic info
        name,
        address,
        phone,
        email,
        website,
        kraPin,
        vatRegistrationNumber,
        
        // Currency & financial
        currency,
        currencySymbol,
        decimal_places,
        thousand_separator,
        decimal_separator,
        vat_rate,
        fiscal_year_start,
        
        // Logo
        logoUrl,
        
        // Banking
        bank_name,
        bank_account_number,
        bank_branch,
        bank_swift_code,
        
        // M-Pesa
        mpesa_paybill,
        mpesa_account_number,
        
        // Social media
        facebook,
        twitter,
        linkedin,
        instagram
      } = req.body;

      console.log('Updating settings for company:', company_id);
      console.log('Received fields:', Object.keys(req.body));

      // Check if settings exist for this company
      const existing = await db.get(
        'SELECT * FROM company_settings WHERE company_id = ? LIMIT 1',
        [company_id]
      );

      let result;
      if (existing) {
        // Update existing - include ALL fields
        result = await db.run(
          `UPDATE company_settings SET
            name = ?,
            address = ?,
            phone = ?,
            email = ?,
            website = ?,
            kra_pin = ?,
            vat_registration_number = ?,
            currency = ?,
            currency_symbol = ?,
            decimal_places = ?,
            thousand_separator = ?,
            decimal_separator = ?,
            vat_rate = ?,
            fiscal_year_start = ?,
            logo_url = ?,
            bank_name = ?,
            bank_account_number = ?,
            bank_branch = ?,
            bank_swift_code = ?,
            mpesa_paybill = ?,
            mpesa_account_number = ?,
            facebook = ?,
            twitter = ?,
            linkedin = ?,
            instagram = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE company_id = ?`,
          [
            name,
            address,
            phone,
            email,
            website,
            kraPin,
            vatRegistrationNumber,
            currency,
            currencySymbol,
            decimal_places || 2,
            thousand_separator || ',',
            decimal_separator || '.',
            vat_rate || 16,
            fiscal_year_start || 'January',
            logoUrl,
            bank_name,
            bank_account_number,
            bank_branch,
            bank_swift_code,
            mpesa_paybill,
            mpesa_account_number,
            facebook,
            twitter,
            linkedin,
            instagram,
            company_id
          ]
        );
      } else {
        // Insert new - include ALL fields
        result = await db.run(
          `INSERT INTO company_settings (
            company_id, name, address, phone, email, website,
            kra_pin, vat_registration_number, currency, currency_symbol,
            decimal_places, thousand_separator, decimal_separator,
            vat_rate, fiscal_year_start, logo_url,
            bank_name, bank_account_number, bank_branch, bank_swift_code,
            mpesa_paybill, mpesa_account_number,
            facebook, twitter, linkedin, instagram,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            company_id, name, address, phone, email, website,
            kraPin, vatRegistrationNumber, currency, currencySymbol,
            decimal_places || 2, thousand_separator || ',', decimal_separator || '.',
            vat_rate || 16, fiscal_year_start || 'January', logoUrl,
            bank_name, bank_account_number, bank_branch, bank_swift_code,
            mpesa_paybill, mpesa_account_number,
            facebook, twitter, linkedin, instagram
          ]
        );
      }

      const updatedSettings = await db.get(
        'SELECT * FROM company_settings WHERE company_id = ? LIMIT 1',
        [company_id]
      );

      console.log('Settings saved successfully');
      res.json(updatedSettings);
    } catch (error) {
      console.error('Error in updateSettings:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = SettingsController;