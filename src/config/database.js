const { Pool } = require('pg');
const { config } = require('./index');

let pool = null;

function getPool() {
  if (!pool) {
    if (!config.databaseUrl) {
      // In development or test without a real database URL, return null or throw depending on operation
      return null;
    }

    const isProduction = config.env === 'production' || config.databaseUrl.includes('render.com');

    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err);
    });
  }
  return pool;
}

function setPool(customPool) {
  pool = customPool;
}

async function query(text, params) {
  const currentPool = getPool();
  if (!currentPool) {
    throw new Error('Database pool not initialized. Please configure DATABASE_URL.');
  }
  const start = Date.now();
  const res = await currentPool.query(text, params);
  const duration = Date.now() - start;
  if (config.env === 'development') {
    // optional debug logging
  }
  return res;
}

async function getClient() {
  const currentPool = getPool();
  if (!currentPool) {
    throw new Error('Database pool not initialized. Please configure DATABASE_URL.');
  }
  const client = await currentPool.connect();
  return client;
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  getPool,
  setPool,
  query,
  getClient,
  closePool
};
