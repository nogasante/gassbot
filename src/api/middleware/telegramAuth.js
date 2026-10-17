const crypto = require('crypto');
const { config } = require('../../config');
const { findOrCreateUser } = require('../../services/userService');

/**
 * Validates Telegram WebApp initData string using HMAC-SHA256 signature verification.
 * @param {string} initDataString - Raw initData string from window.Telegram.WebApp.initData
 * @param {string} [customToken] - Optional bot token override for testing
 * @returns {object|null} - Parsed user object if valid, null otherwise
 */
function validateTelegramWebAppData(initDataString, customToken = null) {
  if (!initDataString || typeof initDataString !== 'string') {
    return null;
  }

  const token = customToken || config.botToken;
  if (!token) {
    return null;
  }

  try {
    const urlParams = new URLSearchParams(initDataString);
    const hash = urlParams.get('hash');
    if (!hash) return null;

    urlParams.delete('hash');

    const dataCheckArr = [];
    for (const [key, value] of urlParams.entries()) {
      dataCheckArr.push(`${key}=${value}`);
    }
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    // HMAC calculation according to Telegram Mini Apps specifications
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash.toLowerCase() !== hash.toLowerCase()) {
      return null;
    }

    const userRaw = urlParams.get('user');
    return userRaw ? JSON.parse(userRaw) : { authDate: urlParams.get('auth_date') };
  } catch (err) {
    console.warn('Failed to parse/validate Telegram initData:', err.message);
    return null;
  }
}

/**
 * Express middleware to validate Telegram initData from Authorization header or body
 */
async function telegramAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  let initData = '';

  if (authHeader.startsWith('TelegramInitData ')) {
    initData = authHeader.slice(17).trim();
  } else if (req.body && req.body.initData) {
    initData = req.body.initData;
  } else if (req.query && req.query.initData) {
    initData = req.query.initData;
  }

  if (!initData) {
    // In dev mode without token, allow guest/mock access if configured
    if (config.env === 'development' && req.headers['x-mock-user']) {
      try {
        req.telegramUser = JSON.parse(req.headers['x-mock-user']);
        return next();
      } catch (e) {}
    }
    return res.status(401).json({ success: false, error: 'Telegram authentication required (initData missing).' });
  }

  const validatedUser = validateTelegramWebAppData(initData);
  if (!validatedUser) {
    return res.status(401).json({ success: false, error: 'Invalid or expired Telegram signature.' });
  }

  try {
    if (validatedUser.id) {
      const dbUser = await findOrCreateUser({
        telegramId: validatedUser.id,
        username: validatedUser.username || null,
        firstName: validatedUser.first_name || '',
        lastName: validatedUser.last_name || ''
      });
      req.dbUser = dbUser;
    }
    req.telegramUser = validatedUser;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  validateTelegramWebAppData,
  telegramAuthMiddleware
};
