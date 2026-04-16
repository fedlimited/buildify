const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function checkUsers() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
  
  console.log('=== USERS ===');
  const users = await db.all('SELECT id, name, email, company_id, role, is_active FROM users');
  users.forEach(u => {
    console.log(`${u.id}: ${u.name} (${u.email}) - Company: ${u.company_id}, Active: ${u.is_active}, Role: ${u.role}`);
  });
  
  console.log('\n=== COMPANIES ===');
  const companies = await db.all('SELECT id, name, subdomain FROM companies');
  companies.forEach(c => {
    console.log(`${c.id}: ${c.name} (${c.subdomain})`);
  });
  
  await db.close();
}

checkUsers();