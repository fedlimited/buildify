const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('Adding store transactions for Supplied POs...\n');

db.all(`SELECT * FROM purchase_orders WHERE status = 'Supplied'`, (err, orders) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  console.log(`Found ${orders.length} Supplied purchase orders\n`);
  
  let totalInserted = 0;
  let processed = 0;
  let totalItems = 0;
  
  // First, count total items
  orders.forEach(order => {
    try {
      const items = JSON.parse(order.items || '[]');
      totalItems += items.length;
    } catch(e) {}
  });
  
  if (totalItems === 0) {
    console.log('No items found in any PO. Please create a PO with items first.');
    db.close();
    return;
  }
  
  orders.forEach(order => {
    console.log(`Processing PO ${order.id}: ${order.order_number}`);
    
    let items = [];
    try {
      items = JSON.parse(order.items || '[]');
      console.log(`  Items found: ${items.length}`);
      
      items.forEach((item, index) => {
        const itemName = item.name || item.description || item.item_name || `Item ${index + 1}`;
        const quantity = item.quantity || 1;
        const unit = item.unit || 'piece';
        
        console.log(`  Inserting: ${itemName} x ${quantity} ${unit}`);
        
        db.run(`
          INSERT INTO store_transactions (
            company_id, 
            project_id, 
            transaction_type, 
            item_name, 
            quantity, 
            unit, 
            reference, 
            date, 
            notes,
            created_at
          ) VALUES (?, ?, 'IN', ?, ?, ?, ?, date('now'), ?, datetime('now'))
        `, [
          order.company_id,
          order.project_id,
          itemName,
          quantity,
          unit,
          `PO-${order.order_number}`,
          `Received from purchase order ${order.order_number}`
        ], function(err) {
          if (err) {
            console.log(`    ❌ Failed: ${err.message}`);
          } else {
            console.log(`    ✅ Inserted (ID: ${this.lastID})`);
            totalInserted++;
          }
          
          processed++;
          if (processed === totalItems) {
            console.log(`\n✅ Completed! Inserted ${totalInserted} store transactions`);
            db.get('SELECT COUNT(*) as count FROM store_transactions', (err, row) => {
              console.log(`📦 Total store transactions now: ${row.count}`);
              db.close();
            });
          }
        });
      });
      
    } catch(e) {
      console.log(`  ❌ Error parsing items: ${e.message}`);
    }
  });
});