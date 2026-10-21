const { query } = require('../config/database');
const { config } = require('../config');

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

async function getUserByUsername(username) {
  if (!username) return null;
  const clean = username.replace(/^@/, '').trim().toLowerCase();
  const res = await query(
    `SELECT id, telegram_id, username, first_name, last_name, role, academic_level, notifications_enabled, created_at, updated_at
     FROM users
     WHERE LOWER(username) = $1
     LIMIT 1;`,
    [clean]
  );
  return res.rows[0] || null;
}

async function promoteUserToAdmin({ telegramId, username = null, firstName = null, lastName = null, role = 'admin', promotedBy = null }) {
  const tid = Number(telegramId);
  if (!tid || isNaN(tid)) {
    throw new Error('A valid numeric Telegram ID is required to promote a user to admin.');
  }

  const cleanRole = (role === 'executive') ? 'executive' : 'admin';
  const cleanUsername = username ? username.replace(/^@/, '').trim() : null;

  const existing = await getUserByTelegramId(tid);
  let userRecord;

  if (existing) {
    const res = await query(
      `UPDATE users
       SET role = $2,
           username = COALESCE($3, username),
           first_name = COALESCE($4, first_name),
           last_name = COALESCE($5, last_name),
           updated_at = NOW()
       WHERE telegram_id = $1
       RETURNING id, telegram_id, username, first_name, last_name, role, academic_level, notifications_enabled, created_at, updated_at;`,
      [tid, cleanRole, cleanUsername, firstName, lastName]
    );
    userRecord = res.rows[0];
  } else {
    const res = await query(
      `INSERT INTO users (telegram_id, username, first_name, last_name, role, notifications_enabled)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING id, telegram_id, username, first_name, last_name, role, academic_level, notifications_enabled, created_at, updated_at;`,
      [tid, cleanUsername, firstName || 'Admin', lastName || '', cleanRole]
    );
    userRecord = res.rows[0];
  }

  try {
    await query(
      `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details)
       VALUES ($1, 'promote_admin', 'user', $2, $3);`,
      [promotedBy ? Number(promotedBy) : null, userRecord.id, JSON.stringify({ telegramId: tid, role: cleanRole })]
    );
  } catch (err) {}

  return userRecord;
}

async function demoteAdmin(telegramId, { demotedBy = null } = {}) {
  const tid = Number(telegramId);
  if (!tid || isNaN(tid)) {
    throw new Error('A valid numeric Telegram ID is required.');
  }

  const superAdmins = (config.adminTelegramIds || []).map(Number);
  if (superAdmins.includes(tid)) {
    throw new Error('Cannot demote a root superadmin configured in environment variables.');
  }

  if (demotedBy && Number(demotedBy) === tid) {
    throw new Error('You cannot remove your own administrator privileges.');
  }

  const res = await query(
    `UPDATE users
     SET role = 'student', updated_at = NOW()
     WHERE telegram_id = $1
     RETURNING id, telegram_id, username, first_name, last_name, role, academic_level, notifications_enabled, created_at, updated_at;`,
    [tid]
  );

  const demotedUser = res.rows[0] || null;

  if (demotedUser) {
    try {
      await query(
        `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details)
         VALUES ($1, 'demote_admin', 'user', $2, $3);`,
        [demotedBy ? Number(demotedBy) : null, demotedUser.id, JSON.stringify({ telegramId: tid, previousRole: 'admin' })]
      );
    } catch (err) {}
  }

  return demotedUser;
}

async function listAllAdmins() {
  const res = await query(
    `SELECT id, telegram_id, username, first_name, last_name, role, academic_level, notifications_enabled, created_at, updated_at
     FROM users
     WHERE role IN ('admin', 'executive')
     ORDER BY created_at ASC;`
  );

  const superAdmins = (config.adminTelegramIds || []).map(Number);
  const rows = res.rows.map(u => ({
    ...u,
    is_superadmin: superAdmins.includes(Number(u.telegram_id))
  }));

  const existingTids = new Set(rows.map(r => Number(r.telegram_id)));
  for (const sId of superAdmins) {
    if (!existingTids.has(sId)) {
      rows.unshift({
        id: null,
        telegram_id: sId,
        username: null,
        first_name: 'Root Superadmin',
        last_name: '',
        role: 'admin',
        is_superadmin: true,
        created_at: new Date()
      });
    }
  }

  return rows;
}

module.exports = {
  findOrCreateUser,
  getUserByTelegramId,
  getUserByUsername,
  updateAcademicLevel,
  toggleNotifications,
  getSubscribedUsers,
  listUsers,
  promoteUserToAdmin,
  demoteAdmin,
  listAllAdmins
};
