require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  botToken: process.env.BOT_TOKEN || '',
  botMode: process.env.BOT_MODE || 'polling', // 'polling' or 'webhook'
  webhookDomain: process.env.WEBHOOK_DOMAIN || '', // e.g. https://gassbot.onrender.com
  webhookPath: process.env.WEBHOOK_PATH || '/webhook',
  miniAppUrl: process.env.MINI_APP_URL || 'https://gass-knust.vercel.app',
  databaseUrl: process.env.DATABASE_URL || '',
  adminTelegramIds: (process.env.ADMIN_TELEGRAM_IDS || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean)
    .map(id => Number(id)),
  aiEnabled: process.env.AI_ENABLED === 'true',
  brand: {
    name: 'GASS-KNUST',
    fullName: 'Ghana Association of Statistics Students - KNUST',
    slogan: 'Statistics for Development',
    colors: {
      primaryRed: '#E00613',
      altRed: '#DE1B1B',
      skyBlue: '#4A90E2',
      altSkyBlue: '#5B9BE6',
      deepTeal: '#0B536F',
      darkText: '#111827'
    },
    links: {
      miniApp: process.env.MINI_APP_URL || 'https://gass-knust.vercel.app',
      github: 'https://github.com/gass-knust',
      website: 'https://gass-knust.vercel.app',
      supportContact: '@gass_executives'
    }
  }
};

function validateConfig() {
  const missing = [];
  if (!config.botToken && config.env === 'production') {
    missing.push('BOT_TOKEN');
  }
  if (!config.databaseUrl && config.env === 'production') {
    missing.push('DATABASE_URL');
  }
  if (config.botMode === 'webhook' && !config.webhookDomain) {
    missing.push('WEBHOOK_DOMAIN (required when BOT_MODE=webhook)');
  }
  return {
    isValid: missing.length === 0,
    missing
  };
}

module.exports = {
  config,
  validateConfig
};
