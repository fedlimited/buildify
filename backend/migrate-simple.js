const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function migrate() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  // Get the demo company
  const company = await db.get('SELECT * FROM companies WHERE subdomain = ?', ['demo']);
  
  if (!company) {
    console.log('Demo company not found!');
    return;
  }

  console.log(`Company ID: ${company.id}`);

  // Insert sample projects
  const projects = [
    { name: 'Nyambera Primary School', client: 'CGoK', contract_sum: 50000000, location: 'Nyambera', status: 'Active' },
    { name: 'Riverside Mall', client: 'Riverside Developers', contract_sum: 100000000, location: 'Westlands', status: 'Active' },
    { name: 'City Heights Apartments', client: 'City Developers', contract_sum: 75000000, location: 'Kilimani', status: 'Active' }
  ];

  for (const project of projects) {
    try {
      const existing = await db.get('SELECT * FROM projects WHERE name = ? AND company_id = ?', [project.name, company.id]);
      if (!existing) {
        await db.run(
          `INSERT INTO projects (company_id, name, client, contract_sum, location, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [company.id, project.name, project.client, project.contract_sum, project.location, project.status, new Date().toISOString()]
        );
        console.log(`✅ Added project: ${project.name}`);
      } else {
        console.log(`⚠️ Project already exists: ${project.name}`);
      }
    } catch(e) {
      console.log(`❌ Error adding project ${project.name}:`, e.message);
    }
  }

  // Insert sample approved items
  const items = [
    { name: 'River Sand', category: 'Building Materials', unit: 'tonne', default_price: 1650 },
    { name: 'Cement (50kg)', category: 'Building Materials', unit: 'bag', default_price: 700 },
    { name: 'Hardcore', category: 'Building Materials', unit: 'tonne', default_price: 2500 },
    { name: 'Ballast', category: 'Building Materials', unit: 'tonne', default_price: 3000 },
    { name: 'Timber 2x4', category: 'Lumber', unit: 'piece', default_price: 450 }
  ];

  for (const item of items) {
    try {
      const existing = await db.get('SELECT * FROM approved_items WHERE name = ? AND company_id = ?', [item.name, company.id]);
      if (!existing) {
        await db.run(
          `INSERT INTO approved_items (company_id, name, category, unit, default_price, is_active, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [company.id, item.name, item.category, item.unit, item.default_price, 1, new Date().toISOString()]
        );
        console.log(`✅ Added item: ${item.name}`);
      } else {
        console.log(`⚠️ Item already exists: ${item.name}`);
      }
    } catch(e) {
      console.log(`❌ Error adding item ${item.name}:`, e.message);
    }
  }

  // Insert sample suppliers
  const suppliers = [
    { name: 'Jumbo Hardware', kra_pin: 'P123456789A', phone: '+254711222333', email: 'sales@jumbo.com', address: 'Industrial Area, Nairobi', contact_person: 'John Kariuki', payment_terms: '30 days' },
    { name: 'Kenya Cement Ltd', kra_pin: 'P987654321B', phone: '+254722333444', email: 'info@kenyacement.com', address: 'Athi River', contact_person: 'Mary Wanjiku', payment_terms: '45 days' }
  ];

  for (const supplier of suppliers) {
    try {
      const existing = await db.get('SELECT * FROM suppliers WHERE name = ? AND company_id = ?', [supplier.name, company.id]);
      if (!existing) {
        await db.run(
          `INSERT INTO suppliers (company_id, name, kra_pin, phone, email, address, contact_person, payment_terms, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [company.id, supplier.name, supplier.kra_pin, supplier.phone, supplier.email, supplier.address, supplier.contact_person, supplier.payment_terms, 1]
        );
        console.log(`✅ Added supplier: ${supplier.name}`);
      } else {
        console.log(`⚠️ Supplier already exists: ${supplier.name}`);
      }
    } catch(e) {
      console.log(`❌ Error adding supplier ${supplier.name}:`, e.message);
    }
  }

  // Show results
  const projectCount = await db.get('SELECT COUNT(*) as count FROM projects WHERE company_id = ?', [company.id]);
  const itemCount = await db.get('SELECT COUNT(*) as count FROM approved_items WHERE company_id = ?', [company.id]);
  const supplierCount = await db.get('SELECT COUNT(*) as count FROM suppliers WHERE company_id = ?', [company.id]);
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`   Projects: ${projectCount.count}`);
  console.log(`   Approved Items: ${itemCount.count}`);
  console.log(`   Suppliers: ${supplierCount.count}`);

  await db.close();
}

migrate().catch(console.error);