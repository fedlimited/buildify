const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

async function migrateLocalStorage() {
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

  // This data would come from your frontend localStorage
  // For now, let's add sample data manually

  // Add sample projects
  const sampleProjects = [
    { name: 'Nyambera Primary School', client: 'CGoK', contract_sum: 50000000, location: 'Nyambera', status: 'Active' },
    { name: 'Riverside Mall', client: 'Riverside Developers', contract_sum: 100000000, location: 'Westlands', status: 'Active' }
  ];

  for (const project of sampleProjects) {
    const existing = await db.get('SELECT * FROM projects WHERE name = ? AND company_id = ?', [project.name, company.id]);
    if (!existing) {
      await db.run(
        `INSERT INTO projects (company_id, name, client, contract_sum, location, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [company.id, project.name, project.client, project.contract_sum, project.location, project.status, new Date().toISOString()]
      );
      console.log(`Added project: ${project.name}`);
    }
  }

  // Add sample approved items
  const sampleItems = [
    { name: 'River Sand', category: 'Building Materials', unit: 'tonne', default_price: 1650 },
    { name: 'Cement', category: 'Building Materials', unit: 'bag', default_price: 700 },
    { name: 'Hardcore', category: 'Building Materials', unit: 'tonne', default_price: 2500 }
  ];

  for (const item of sampleItems) {
    const existing = await db.get('SELECT * FROM approved_items WHERE name = ? AND company_id = ?', [item.name, company.id]);
    if (!existing) {
      await db.run(
        `INSERT INTO approved_items (company_id, name, category, unit, default_price, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [company.id, item.name, item.category, item.unit, item.default_price, 1, new Date().toISOString()]
      );
      console.log(`Added item: ${item.name}`);
    }
  }

  console.log('\n✅ Migration completed!');
  
  // Show summary
  const projects = await db.all('SELECT * FROM projects WHERE company_id = ?', [company.id]);
  const items = await db.all('SELECT * FROM approved_items WHERE company_id = ?', [company.id]);
  
  console.log(`\n📊 Summary:`);
  console.log(`   Projects: ${projects.length}`);
  console.log(`   Approved Items: ${items.length}`);

  await db.close();
}

migrateLocalStorage().catch(console.error);