const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function addCompanyId() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
  
  const tables = ['approved_items', 'suppliers', 'expenses', 'purchase_orders', 'supplies', 'store_transactions', 'payroll_records', 'workers', 'worker_categories'];
  
  for (const table of tables) {
    try {
      await db.exec(`ALTER TABLE ${table} ADD COLUMN company_id INTEGER DEFAULT 1`);
      console.log(`✅ Added company_id to ${table}`);
    } catch (err) {
      console.log(`⚠️ ${table}: ${err.message}`);
    }
  }
  
  console.log('\n✅ Done!');
  await db.close();
}

addCompanyId();