const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5433, database: 'muiska', user: 'postgres', password: 'postgres' });

async function test() {
  const result = await pool.query('SELECT id FROM categories WHERE name = $1', ['Tecnología']);
  console.log('Result:', result.rows);
  await pool.end();
}

test();