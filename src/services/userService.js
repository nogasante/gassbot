const { query } = require('../config/database');

async function findOrCreateUser({ telegramId, username, firstName, lastName, role = 'student' }) {
  const selectQuery = `
    SELECT id, telegram_id, username, first_name, last_name, role, academic_level, notifications_enabled, created_at, updated_at
    FROM users
    WHERE telegram_id = $1;
  `;
  const existing = await query(selectQuery, [telegramId]);
  if (existing.rows.length > 0) {
    const updateQuery = `
      UPDATE users
      SET username = COALESCE($2, username),
          first_name = COALESCE($3, first_name),
          last_name = COALESCE($4, last_name),
          updated_at = NOW()
      WHERE telegram_id = $1
      RETURNING id, telegram_id, username, first_name, last_name, role, academic_level, notifications_enabled, created_at, updated_at;
    `;
    const updated = await query(updateQuery, [telegramId, username, firstName, lastName]);
    return updated.rows[0];
  }

  const insertQuery = `
    INSERT INTO users (telegram_id, username, first_name, last_name, role, notifications_enabled)
    VALUES ($1, $2, $3, $4, $5, TRUE)
    RETURNING id, telegram_id, username, first_name, last_name, role, academic_level, notifications_enabled, created_at, updated_at;
  `;
  const res = await query(insertQuery, [telegramId, username, firstName, lastName, role]);
  return res.rows[0];
}

async function getUserByTelegramId(telegramId) {
  const res = await query(
    `SELECT id, telegram_id, username, first_name, last_name, role, academic_level, notifications_enabled, created_at, updated_at
     FROM users
     WHERE telegram_id = $1;`,
    [telegramId]
  );
  return res.rows[0] || null;
}

async function updateAcademicLevel(telegramId, level) {
  const res = await query(
    `UPDATE users
     SET academic_level = $2, updated_at = NOW()
     WHERE telegram_id = $1
     RETURNING id, telegram_id, academic_level;`,
    [telegramId, level]
  );
  return res.rows[0] || null;
}

async function toggleNotifications(telegramId, enabled) {
  const res = await query(
    `UPDATE users
     SET notifications_enabled = $2, updated_at = NOW()
     WHERE telegram_id = $1
     RETURNING id, telegram_id, notifications_enabled;`,
    [telegramId, enabled]
  );
  return res.rows[0] || null;
}

async function getSubscribedUsers(targetLevel = null) {
  if (targetLevel) {
    const res = await query(
      `SELECT id, telegram_id, first_name, academic_level
       FROM users
       WHERE notifications_enabled = TRUE
         AND (academic_level = $1 OR academic_level IS NULL);`,
      [targetLevel]
    );
    return res.rows;
  }
  const res = await query(
    `SELECT id, telegram_id, first_name, academic_level
     FROM users
     WHERE notifications_enabled = TRUE;`
  );
  return res.rows;
}

async function listUsers({ limit = 50, offset = 0, role = null } = {}) {
  let q = `
    SELECT id, telegram_id, username, first_name, last_name, role, academic_level, notifications_enabled, created_at
    FROM users
  `;
  const params = [];
  if (role) {
    params.push(role);
    q += ` WHERE role = $${params.length}`;
  }
  q += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2};`;
  params.push(limit, offset);
  const res = await query(q, params);
  return res.rows;
}

module.exports = {
  findOrCreateUser,
  getUserByTelegramId,
  updateAcademicLevel,
  toggleNotifications,
  getSubscribedUsers,
  listUsers
};
