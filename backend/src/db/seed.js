import fs from 'fs';
import path from 'path';
import { pool } from '../config/database.js';
import { config } from '../config/index.js';

const SEEDS_DIR = path.resolve('./src/db/seeds');

async function ensureSeedTrackingTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_seeds (
            version VARCHAR(50) PRIMARY KEY,
            applied_at TIMESTAMP DEFAULT NOW()
        )
    `);
}

async function getAppliedSeeds() {
    const result = await pool.query('SELECT version FROM schema_seeds ORDER BY version');
    return result.rows.map(r => r.version);
}

async function getPendingSeeds() {
    const applied = await getAppliedSeeds();
    const files = fs.readdirSync(SEEDS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort();
    
    return files
        .map(f => f.replace('.sql', ''))
        .filter(v => !applied.includes(v));
}

async function runSeed(version) {
    const filePath = path.join(SEEDS_DIR, `${version}.sql`);
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_seeds (version) VALUES ($1)', [version]);
        await client.query('COMMIT');
        console.log(`✓ Seed ${version} applied`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`✗ Seed ${version} failed:`, error.message);
        throw error;
    } finally {
        client.release();
    }
}

export async function seed() {
    console.log('Running database seeds...');
    
    // Only run if RUN_SEEDS=true (for development/docker)
    if (process.env.RUN_SEEDS !== 'true') {
        console.log('Skipping seeds (RUN_SEEDS!=true)');
        return;
    }
    
    // Ensure migrations table exists
    await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_seeds (
            version VARCHAR(50) PRIMARY KEY,
            applied_at TIMESTAMP DEFAULT NOW()
        )
    `);
    
    const pending = await getPendingSeeds();
    
    if (pending.length === 0) {
        console.log('No pending seeds');
        return;
    }
    
    console.log(`Found ${pending.length} pending seed(s):`, pending.join(', '));
    
    for (const version of pending) {
        await runSeed(version);
    }
    
    console.log('All seeds completed successfully');
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[2];
    
    if (command === 'run') {
        await seed();
    } else {
        console.log('Usage: node seed.js run');
        process.exit(1);
    }
    
    await pool.end();
    process.exit(0);
}