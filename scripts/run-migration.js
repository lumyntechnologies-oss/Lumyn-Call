import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL or NEON_DATABASE_URL environment variable not set');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('NEON')));
  process.exit(1);
}

async function runMigration() {
  try {
    console.log('[Migration] Connecting to Neon database...');
    const sql = neon(DATABASE_URL);

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'init-db.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Split by semicolon and filter empty statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`[Migration] Found ${statements.length} statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await sql(statement);
        console.log(`[Migration] ✓ Statement ${i + 1}/${statements.length} executed`);
      } catch (error) {
        console.error(`[Migration] ✗ Statement ${i + 1} failed:`, error.message);
        throw error;
      }
    }

    console.log('[Migration] ✓ Database migration completed successfully!');
  } catch (error) {
    console.error('[Migration] ✗ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
