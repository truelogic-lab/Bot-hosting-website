import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,                              // Supabase pooler: keep it small
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 20000,
});

// Disable statement name cache (required for pgBouncer transaction mode)
pool.on('connect', (client) => {
  client.connectionParameters.statement_cache_size = 0;
});

pool.on('error', (err) => {
  console.error('💥 Pool error (recovering):', err.message);
});

pool.query('SELECT NOW()')
  .then((res) => console.log('✅ PostgreSQL connected at', res.rows[0].now))
  .catch((err) => {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
  });
