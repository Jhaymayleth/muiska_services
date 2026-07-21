import fs from 'fs';
import path from 'path';
import { pool } from '../config/database.js';

const MIGRATIONS_DIR = path.resolve('./src/db/migrations');
const BACKUP_DIR = path.resolve('./backups');

async function ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
}

async function backupSchema(timestamp) {
    await ensureBackupDir();
    const backupFile = path.join(BACKUP_DIR, `schema_backup_${timestamp}.sql`);
    const client = await pool.connect();
    try {
        // Get schema-only dump using pg_dump would be ideal, but we'll use a simple approach
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        `);
        
        let backupContent = `-- Schema backup: ${new Date().toISOString()}\n\n`;
        
        for (const row of tablesResult.rows) {
            const tableName = row.table_name;
            const createResult = await client.query(`
                SELECT 'CREATE TABLE ' || quote_ident($1) || ' (' || 
                       string_agg(column_name || ' ' || data_type, ', ') || ');' as ddl
                FROM information_schema.columns 
                WHERE table_name = $1 AND table_schema = 'public'
            `, [tableName]);
            
            if (createResult.rows.length > 0) {
                backupContent += createResult.rows[0].ddl + '\n\n';
            }
        }
        
        fs.writeFileSync(backupFile, backupContent);
        console.log(`  📦 Schema backup: ${backupFile}`);
    } finally {
        client.release();
    }
}

async function ensureMigrationsTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version VARCHAR(50) PRIMARY KEY,
            applied_at TIMESTAMP DEFAULT NOW()
        )
    `);
}

async function getAppliedMigrations() {
    const result = await pool.query('SELECT version FROM schema_migrations ORDER BY version');
    return result.rows.map(r => r.version);
}

async function getPendingMigrations() {
    const applied = await getAppliedMigrations();
    const files = fs.readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort();
    
    return files
        .map(f => f.replace('.sql', ''))
        .filter(v => !applied.includes(v));
}

async function runMigration(version) {
    const filePath = path.join(MIGRATIONS_DIR, `${version}.sql`);
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    // Backup before each migration
    const timestamp = `${version}_${Date.now()}`;
    await backupSchema(timestamp);
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
        await client.query('COMMIT');
        console.log(`✓ Migration ${version} applied`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`✗ Migration ${version} failed:`, error.message);
        throw error;
    } finally {
        client.release();
    }
}

export async function migrate() {
    console.log('Running database migrations...');
    
    await ensureMigrationsTable();
    const pending = await getPendingMigrations();
    
    if (pending.length === 0) {
        console.log('No pending migrations');
        return;
    }
    
    console.log(`Found ${pending.length} pending migration(s):`, pending.join(', '));
    
    for (const version of pending) {
        await runMigration(version);
    }
    
    console.log('All migrations completed successfully');
}

export async function migrateDown(version) {
    // Not implemented - migrations are forward-only
    console.warn('Rollback not implemented. Use database backup for recovery.');
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[2];
    
    if (command === 'up') {
        await migrate();
    } else if (command === 'down' && process.argv[3]) {
        await migrateDown(process.argv[3]);
    } else {
        console.log('Usage: node migrate.js [up|down <version>]');
        process.exit(1);
    }
    
    await pool.end();
    process.exit(0);
}