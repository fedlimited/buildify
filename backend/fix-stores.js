const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('Checking Purchase Orders...\n');

db.all(`SELECT id, order_number, status, items, project_id, company_id FROM purchase_orders WHERE status = 'Supplied'`, (err, orders) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  console.log('Found', orders.length, 'Supplied POs\n');
  
  if (orders.length === 0) {
    console.log('No Supplied POs found. Please mark a PO as Supplied first.');
    db.close();
    return;
  }
  
  orders.forEach(order => {
    console.log('=' .repeat(50));
    console.log('PO ID:', order.id);
    console.log('PO Number:', order.order_number);
    console.log('Project ID:', order.project_id);
    console.log('Company ID:', order.company_id);
    console.log('Items (raw):', order.items);
    
    let items = [];
    try {
      items = JSON.parse(order.items || '[]');
      console.log('Items parsed count:', items.length);
      
      if (items.length > 0) {
        items.forEach((item, idx) => {
          console.log(`  Item ${idx + 1}:`, item.name || item.description || 'Unknown');
        });
      } else {
        console.log('  No items found in this PO');
      }
    } catch(e) {
      console.log('Error parsing items:', e.message);
    }
    console.log('');
  });
  
  db.close();
});