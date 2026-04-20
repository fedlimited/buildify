const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function migrate() {
  const db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  console.log('Adding payment columns to invoices table...');
  
  const columns = [
    'mpesa_checkout_id TEXT',
    'payment_status TEXT DEFAULT "unpaid"',
    'payment_method TEXT DEFAULT "mpesa"',
    'payment_reference TEXT',
    'payment_date TEXT',
    'paid_amount REAL DEFAULT 0',
    'mpesa_receipt TEXT',
    'payment_error TEXT'
  ];
  
  for (const col of columns) {
    const colName = col.split(' ')[0];
    try {
      await db.run(`ALTER TABLE invoices ADD COLUMN ${col}`);
      console.log(`✅ Added ${colName} column`);
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        console.log(`⚠️ ${colName} already exists`);
      } else {
        console.log(`❌ Error adding ${colName}: ${e.message}`);
      }
    }
  }

  // Create payment_settings table
  console.log('Creating payment_settings table...');
  await db.exec(`
    CREATE TABLE IF NOT EXISTS payment_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      paybill_number TEXT DEFAULT '222111',
      account_number TEXT DEFAULT '170xxx17760',
      account_name TEXT DEFAULT 'FINITE ELEMENT DESIGNS LIMITED',
      bank_name TEXT DEFAULT 'Family Bank',
      bank_branch TEXT DEFAULT 'Kasarani',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ payment_settings table ready');

  // Insert default settings for existing companies
  const result = await db.run(`
    INSERT OR IGNORE INTO payment_settings (company_id, paybill_number, account_number, account_name, bank_name, bank_branch)
    SELECT id, '222111', '170xxx17760', 'FINITE ELEMENT DESIGNS LIMITED', 'Family Bank', 'Kasarani'
    FROM companies
  `);
  console.log(`✅ Default payment settings inserted`);

  console.log('Migration complete!');
  await db.close();
}

migrate().catch(console.error);