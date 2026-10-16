const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

async function runMigrations() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Running database migrations...');
  await query(schemaSql);
  console.log('Database migrations completed successfully.');
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration script finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { runMigrations };
