const https = require('https');
const http = require('http');

function startKeepAlive({
  url = null,
  intervalMs = 10 * 60 * 1000,
  initialDelayMs = 2 * 60 * 1000
} = {}) {
  const target = url || process.env.KEEP_ALIVE_URL || process.env.RENDER_EXTERNAL_URL || (process.env.NODE_ENV === 'production' ? 'https://gassbot-bfbv.onrender.com/health' : null);

  if (!target) {
    return null;
  }

  const healthUrl = target.endsWith('/health') ? target : `${target.replace(/\/$/, '')}/health`;
  const isHttps = healthUrl.startsWith('https:');
  const client = isHttps ? https : http;

  const ping = () => {
    try {
      const req = client.get(healthUrl, (res) => {
        res.on('data', () => {});
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            console.log(`[Keep-Alive] Pinged ${healthUrl} - Status: ${res.statusCode} (${new Date().toISOString()})`);
          } else {
            console.warn(`[Keep-Alive] Ping returned status: ${res.statusCode}`);
          }
        });
      });

      req.on('error', (err) => {
        console.warn(`[Keep-Alive] Ping request warning: ${err.message}`);
      });

      req.setTimeout(15000, () => {
        req.destroy();
      });
    } catch (e) {
      console.warn(`[Keep-Alive] Execution warning:`, e.message);
    }
  };

  console.log(`📡 Keep-Alive service initialized for: ${healthUrl} (every ${Math.round(intervalMs / 60000)}m)`);

  let initialTimeout = null;
  if (initialDelayMs > 0) {
    initialTimeout = setTimeout(ping, initialDelayMs);
    if (initialTimeout.unref) initialTimeout.unref();
  }

  const intervalId = setInterval(ping, intervalMs);
  if (intervalId.unref) intervalId.unref();

  return {
    ping,
    stop: () => {
      if (initialTimeout) clearTimeout(initialTimeout);
      clearInterval(intervalId);
    }
  };
}

module.exports = { startKeepAlive };
