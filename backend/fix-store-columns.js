const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Add missing columns if they don't exist
const columns = [
  'ALTER TABLE store_transactions ADD COLUMN issued_to TEXT',
  'ALTER TABLE store_transactions ADD COLUMN returned_by TEXT',
  'ALTER TABLE store_transactions ADD COLUMN category TEXT'
];

let completed = 0;

columns.forEach(sql => {
  db.run(sql, (err) => {
    if (err && !err.message.includes('duplicate')) {
      console.log('Error:', err.message);
    } else {
      console.log('✓ Column check passed:', sql);
    }
    completed++;
    if (completed === columns.length) {
      console.log('\n✅ Database update completed!');
      db.close();
    }
  });
});