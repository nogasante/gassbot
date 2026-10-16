const { config, validateConfig } = require('./config');
const { getPool, closePool } = require('./config/database');
const { runMigrations } = require('./database/migrate');
const { createBot } = require('./bot');
const { createServer } = require('./api/server');

async function main() {
  console.log(`=======================================================`);
  console.log(`🇬🇭  GASSBot - ${config.brand.fullName}`);
  console.log(`📢  "${config.brand.slogan}"`);
  console.log(`🚀  Environment: ${config.env} | Mode: ${config.botMode}`);
  console.log(`=======================================================`);

  const validation = validateConfig();
  if (!validation.isValid) {
    console.warn('⚠️  Configuration warnings: Missing', validation.missing.join(', '));
  }

  // 1. Initialize Database
  if (config.databaseUrl) {
    try {
      console.log('Connecting to PostgreSQL database...');
      const pool = getPool();
      await pool.query('SELECT 1;');
      console.log('✅ PostgreSQL database connected successfully.');

      // Auto-run schema migrations if in development or explicitly requested
      if (process.env.AUTO_MIGRATE === 'true' || config.env === 'development') {
        await runMigrations();
      }
    } catch (dbErr) {
      console.error('❌ Database connection error:', dbErr.message);
    }
  } else {
    console.warn('⚠️  DATABASE_URL is not set. Running in limited mode without persistent database.');
  }

  // 2. Initialize Telegram Bot
  let bot = null;
  if (config.botToken) {
    try {
      bot = createBot();
      console.log('✅ Telegram bot instance created.');
    } catch (botErr) {
      console.error('❌ Failed to create bot instance:', botErr.message);
    }
  } else {
    console.warn('⚠️  BOT_TOKEN is not set. Telegram bot will not be active.');
  }

  // 3. Initialize Express Web Server
  const app = createServer(bot);
  const server = app.listen(config.port, () => {
    console.log(`✅ Web & API server listening on port ${config.port}`);
  });

  // 4. Start Bot in Polling or Webhook Mode
  if (bot && config.botToken) {
    if (config.botMode === 'webhook') {
      const webhookUrl = `${config.webhookDomain}${config.webhookPath}`;
      console.log(`Setting Telegram webhook to: ${webhookUrl}`);
      try {
        await bot.api.setWebhook(webhookUrl);
        console.log(`✅ Webhook set successfully.`);
      } catch (whErr) {
        console.error('❌ Failed to set Telegram webhook:', whErr.message);
      }
    } else {
      console.log('Starting Telegram bot in Long Polling mode...');
      bot.start({
        onStart: (info) => {
          console.log(`✅ GASSBot polling started as @${info.username} (ID: ${info.id})`);
        }
      }).catch((pollErr) => {
        console.error('❌ Polling error:', pollErr.message);
      });
    }
  }

  // Graceful Shutdown
  const shutdown = async () => {
    console.log('\nShutting down GASSBot gracefully...');
    if (bot && config.botMode === 'polling') {
      try {
        await bot.stop();
      } catch (e) {}
    }
    server.close(async () => {
      console.log('HTTP server closed.');
      await closePool();
      console.log('Database pool closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  });
}

module.exports = { main };
