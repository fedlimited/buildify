const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

async function addTestUser() {
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
  
  console.log(`Demo Company ID: ${company.id}`);
  
  // Check if test user already exists
  const existing = await db.get('SELECT * FROM users WHERE email = ? AND company_id = ?', 
    ['testuser@demo.com', company.id]);
  
  if (existing) {
    console.log('Test user already exists!');
    console.log(existing);
  } else {
    // Hash password
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Create test user
    const result = await db.run(
      `INSERT INTO users (company_id, name, email, password, role, permissions, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [company.id, 'Test User', 'testuser@demo.com', hashedPassword, 'user', '[]', 1, new Date().toISOString()]
    );
    
    console.log(`Test user created with ID: ${result.lastID}`);
  }
  
  // Show all users for this company
  const users = await db.all('SELECT id, name, email, role, is_active FROM users WHERE company_id = ?', [company.id]);
  console.log('\nAll users for demo company:');
  users.forEach(u => {
    console.log(`  ${u.id}: ${u.name} (${u.email}) - Role: ${u.role}, Active: ${u.is_active}`);
  });
  
  await db.close();
}

addTestUser();