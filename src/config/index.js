require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  botToken: process.env.BOT_TOKEN || '',
  botMode: process.env.BOT_MODE || 'polling', // 'polling' or 'webhook'
  webhookDomain: process.env.WEBHOOK_DOMAIN || '', // e.g. https://gassbot.onrender.com
  webhookPath: process.env.WEBHOOK_PATH || '/webhook',
  miniAppUrl: process.env.MINI_APP_URL || 'https://gassbot.vercel.app',
  appPlayStoreUrl: process.env.GASSA_PLAYSTORE_URL || 'https://play.google.com/store/apps/details?id=gasshub.android',
  databaseUrl: process.env.DATABASE_URL || '',
  adminTelegramIds: (process.env.ADMIN_TELEGRAM_IDS || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean)
    .map(id => Number(id)),
  aiEnabled: process.env.AI_ENABLED === 'true',
  brand: {
    name: process.env.BRAND_NAME || 'GASS-KNUST',
    fullName: process.env.BRAND_FULL_NAME || 'Ghana Association of Statistics Students - KNUST',
    slogan: process.env.BRAND_SLOGAN || 'Statistics for Development',
    colors: {
      primaryRed: process.env.COLOR_PRIMARY_RED || '#E00613',
      altRed: process.env.COLOR_ALT_RED || '#DE1B1B',
      skyBlue: process.env.COLOR_SKY_BLUE || '#4A90E2',
      altSkyBlue: process.env.COLOR_ALT_SKY_BLUE || '#5B9BE6',
      deepTeal: process.env.COLOR_DEEP_TEAL || '#0B536F',
      darkText: process.env.COLOR_DARK_TEXT || '#111827'
    },
    links: {
      playStore: process.env.GASSA_PLAYSTORE_URL || 'https://play.google.com/store/apps/details?id=gasshub.android',
      miniApp: process.env.MINI_APP_URL || 'https://gassbot.vercel.app',
      github: process.env.GITHUB_URL || 'https://github.com/gass-knust',
      website: process.env.WEBSITE_URL || 'https://gassbot.vercel.app',
      supportContact: process.env.SUPPORT_CONTACT || '@gass_executives'
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
