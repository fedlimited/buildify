const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

async function migrate() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  console.log('🔧 Starting multi-tenant migration...\n');

  // Step 1: Create companies table
  console.log('1. Creating companies table...');
  await db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subdomain TEXT UNIQUE NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      kra_pin TEXT,
      currency TEXT DEFAULT 'KES',
      currency_symbol TEXT DEFAULT 'KES',
      logo_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('   ✅ Companies table created');

  // Step 2: Check if users table has company_id column
  const tableInfo = await db.all("PRAGMA table_info(users)");
  const hasCompanyId = tableInfo.some(col => col.name === 'company_id');
  
  if (!hasCompanyId) {
    console.log('\n2. Adding company_id column to users table...');
    
    // SQLite doesn't support adding foreign key constraints directly, so we need to recreate
    // First, create a new users table with company_id
    await db.exec(`
      CREATE TABLE users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        permissions TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);
    
    // Copy data from old users table (if any)
    const oldUsers = await db.all('SELECT * FROM users');
    
    if (oldUsers.length > 0) {
      console.log(`   Found ${oldUsers.length} existing users`);
      // Create a default company for existing users
      const result = await db.run(
        `INSERT INTO companies (name, subdomain, email, is_active, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        ['Default Company', 'default', 'default@bochaberi.com', 1, new Date().toISOString()]
      );
      const defaultCompanyId = result.lastID;
      console.log(`   Created default company (ID: ${defaultCompanyId}) for existing users`);
      
      // Copy users with default company_id
      for (const user of oldUsers) {
        await db.run(
          `INSERT INTO users_new (id, company_id, name, email, password, role, permissions, is_active, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [user.id, defaultCompanyId, user.name, user.email, user.password, user.role, user.permissions, user.is_active, user.created_at]
        );
      }
    }
    
    // Replace old table with new one
    await db.exec(`DROP TABLE users`);
    await db.exec(`ALTER TABLE users_new RENAME TO users`);
    console.log('   ✅ Users table migrated with company_id');
  } else {
    console.log('\n2. Users table already has company_id column');
  }

  // Step 3: Create demo company if not exists
  console.log('\n3. Creating demo company...');
  const demoCompany = await db.get('SELECT * FROM companies WHERE subdomain = ?', ['demo']);
  
  let demoCompanyId;
  if (!demoCompany) {
    const result = await db.run(
      `INSERT INTO companies (name, subdomain, email, phone, address, kra_pin, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Demo Construction Ltd', 'demo', 'demo@bochaberi.com', '+254 700 000 000', 'Nairobi, Kenya', 'P051012345Z', 1, new Date().toISOString()]
    );
    demoCompanyId = result.lastID;
    console.log(`   ✅ Demo company created (ID: ${demoCompanyId})`);
  } else {
    demoCompanyId = demoCompany.id;
    console.log(`   ✅ Demo company already exists (ID: ${demoCompanyId})`);
  }

  // Step 4: Create demo admin user
  console.log('\n4. Creating demo admin user...');
  const demoUser = await db.get('SELECT * FROM users WHERE email = ? AND company_id = ?', ['admin@demo.com', demoCompanyId]);
  
  if (!demoUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.run(
      `INSERT INTO users (company_id, name, email, password, role, permissions, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [demoCompanyId, 'Admin User', 'admin@demo.com', hashedPassword, 'admin', '[]', 1, new Date().toISOString()]
    );
    console.log('   ✅ Demo admin user created: admin@demo.com / admin123');
  } else {
    console.log('   ✅ Demo admin user already exists');
  }

  // Step 5: Show summary
  console.log('\n📊 Migration Summary:');
  const companies = await db.all('SELECT id, name, subdomain FROM companies');
  console.log(`   Companies: ${companies.length}`);
  companies.forEach(c => console.log(`     - ${c.name} (${c.subdomain})`));
  
  const users = await db.all('SELECT id, name, email, company_id FROM users');
  console.log(`   Users: ${users.length}`);
  users.forEach(u => console.log(`     - ${u.name} (${u.email}) - Company ID: ${u.company_id}`));

  await db.close();
  
  console.log('\n✅ Migration completed successfully!');
  console.log('\n🎉 You can now login with:');
  console.log('   Domain: demo');
  console.log('   Email: admin@demo.com');
  console.log('   Password: admin123');
}

migrate().catch(console.error);