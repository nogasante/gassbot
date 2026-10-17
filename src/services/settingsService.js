const { query } = require('../config/database');
const { config } = require('../config');

async function getSetting(key, fallback = null) {
  try {
    const res = await query(
      `SELECT key, value, description, updated_at
       FROM app_settings
       WHERE key = $1
       LIMIT 1;`,
      [key]
    );
    if (res.rows && res.rows.length > 0) {
      return res.rows[0].value;
    }
  } catch (err) {
    console.warn(`Error querying app_settings for ${key}:`, err.message);
  }
  return fallback;
}

async function getAllSettings() {
  try {
    const res = await query(
      `SELECT key, value, description, updated_at
       FROM app_settings
       ORDER BY key ASC;`
    );
    return res.rows;
  } catch (err) {
    console.warn('Error querying all app_settings:', err.message);
    return [];
  }
}

async function setSetting(key, value, description = null) {
  const res = await query(
    `INSERT INTO app_settings (key, value, description, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (key) DO UPDATE
     SET value = EXCLUDED.value, description = COALESCE(EXCLUDED.description, app_settings.description), updated_at = NOW()
     RETURNING key, value, description, updated_at;`,
    [key, String(value), description]
  );
  return res.rows[0];
}

async function deleteSetting(key) {
  const res = await query(
    `DELETE FROM app_settings WHERE key = $1 RETURNING key;`,
    [key]
  );
  return res.rows[0] || null;
}

async function getBrandConfig() {
  const settings = await getAllSettings();
  const map = {};
  settings.forEach(s => {
    map[s.key] = s.value;
  });

  return {
    name: map.brand_name || config.brand.name,
    fullName: map.brand_full_name || config.brand.fullName,
    slogan: map.brand_slogan || config.brand.slogan,
    links: {
      playStore: map.play_store_url || config.brand.links.playStore,
      miniApp: map.mini_app_url || config.brand.links.miniApp,
      github: map.github_url || config.brand.links.github,
      website: map.website_url || config.brand.links.website,
      supportContact: map.support_contact || config.brand.links.supportContact
    }
  };
}

module.exports = {
  getSetting,
  getAllSettings,
  setSetting,
  deleteSetting,
  getBrandConfig
};
