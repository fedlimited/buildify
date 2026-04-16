const { getDb } = require('../config/database');

const currencyController = {
  // Get company currency settings
  getCurrencySettings: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      
      let settings = await db.get(
        'SELECT * FROM currency_settings WHERE company_id = ?',
        [company_id]
      );
      
      if (!settings) {
        // Create default settings if none exist
        await db.run(
          `INSERT INTO currency_settings (company_id, currency_code, currency_symbol) 
           VALUES (?, 'KES', 'KSh')`,
          [company_id]
        );
        settings = await db.get(
          'SELECT * FROM currency_settings WHERE company_id = ?',
          [company_id]
        );
      }
      
      res.json(settings);
    } catch (error) {
      console.error('Error in getCurrencySettings:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Update currency settings
  updateCurrencySettings: async (req, res) => {
    try {
      const db = await getDb();
      const company_id = req.user?.companyId || req.user?.company_id;
      const { currency_code, currency_symbol, decimal_places, thousand_separator, decimal_separator } = req.body;
      
      await db.run(
        `INSERT OR REPLACE INTO currency_settings 
         (company_id, currency_code, currency_symbol, decimal_places, thousand_separator, decimal_separator, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [company_id, currency_code, currency_symbol, decimal_places || 2, thousand_separator || ',', decimal_separator || '.']
      );
      
      const updated = await db.get(
        'SELECT * FROM currency_settings WHERE company_id = ?',
        [company_id]
      );
      
      res.json(updated);
    } catch (error) {
      console.error('Error in updateCurrencySettings:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Get all available currencies
  getAvailableCurrencies: async (req, res) => {
    const currencies = [
      { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States' },
      { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union' },
      { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom' },
      { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', country: 'Kenya' },
      { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', country: 'Uganda' },
      { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', country: 'Tanzania' },
      { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc', country: 'Rwanda' },
      { code: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa' },
      { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', country: 'Nigeria' },
      { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', country: 'Ghana' },
      { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', country: 'Egypt' },
      { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', country: 'UAE' },
      { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', country: 'Saudi Arabia' },
      { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India' },
      { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China' },
      { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan' },
      { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia' },
      { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', country: 'Canada' },
      { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', country: 'Switzerland' },
      { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', country: 'Sweden' }
    ];
    res.json(currencies);
  }
};

module.exports = currencyController;