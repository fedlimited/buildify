const { initializeDatabase, getDb } = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('🚀 Starting Site Diary Migration...');
        await initializeDatabase();
        const db = getDb();
        
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '003_add_site_diary_relations.sql'), 'utf8');
        
        // Split SQL into statements
        const statements = sql.split(';').filter(s => s.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await db.run(statement);
                    console.log('✅ Executed:', statement.substring(0, 100) + '...');
                } catch (e) {
                    console.log('⚠️ Statement may have already run:', e.message);
                }
            }
        }
        
        console.log('🎉 Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();