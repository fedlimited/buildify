const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Add missing columns for StoresModule
const columns = [
  'ALTER TABLE store_transactions ADD COLUMN category TEXT',
  'ALTER TABLE store_transactions ADD COLUMN quantity_supplied REAL DEFAULT 0',
  'ALTER TABLE store_transactions ADD COLUMN quantity_issued REAL DEFAULT 0',
  'ALTER TABLE store_transactions ADD COLUMN quantity_returned REAL DEFAULT 0',
  'ALTER TABLE store_transactions ADD COLUMN balance REAL DEFAULT 0',
  'ALTER TABLE store_transactions ADD COLUMN issued_to TEXT',
  'ALTER TABLE store_transactions ADD COLUMN returned_by TEXT'
];

let completed = 0;

columns.forEach(sql => {
  db.run(sql, (err) => {
    if (err && !err.message.includes('duplicate')) {
      console.log('Error:', err.message);
    } else {
      console.log('✓', sql);
    }
    completed++;
    if (completed === columns.length) {
      console.log('\n✅ All columns added successfully!');
      db.close();
    }
  });
});