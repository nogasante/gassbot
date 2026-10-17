const { query } = require('../config/database');

const defaultResourceTypes = [
  { key: 'past_question', label: '📑 Past Question', icon: '📑', orderIndex: 1 },
  { key: 'lecture_slide', label: '📊 Lecture Slide', icon: '📊', orderIndex: 2 },
  { key: 'note', label: '📝 Lecture Notes', icon: '📝', orderIndex: 3 },
  { key: 'syllabus', label: '📋 Syllabus', icon: '📋', orderIndex: 4 },
  { key: 'e_book', label: '📚 Textbook', icon: '📚', orderIndex: 5 },
  { key: 'code_repo', label: '💻 Code', icon: '💻', orderIndex: 6 }
];

async function getAllResourceTypes({ activeOnly = true } = {}) {
  try {
    let q = `
      SELECT id, key, label, icon, order_index, is_active, created_at
      FROM resource_types
    `;
    const params = [];
    if (activeOnly) {
      q += ` WHERE is_active = TRUE`;
    }
    q += ` ORDER BY order_index ASC, id ASC;`;

    const res = await query(q, params);
    if (res.rows && res.rows.length > 0) {
      return res.rows;
    }
    return defaultResourceTypes;
  } catch (err) {
    console.warn('Error fetching resource types from DB, falling back to defaults:', err.message);
    return defaultResourceTypes;
  }
}

async function getResourceTypeByKey(key) {
  if (!key) return null;
  const cleanKey = key.trim().toLowerCase();
  try {
    const res = await query(
      `SELECT id, key, label, icon, order_index, is_active, created_at
       FROM resource_types
       WHERE LOWER(key) = $1
       LIMIT 1;`,
      [cleanKey]
    );
    if (res.rows && res.rows.length > 0) {
      return res.rows[0];
    }
    return null;
  } catch (err) {
    console.warn('Error fetching resource type by key from DB:', err.message);
    const fallback = defaultResourceTypes.find(t => t.key.toLowerCase() === cleanKey);
    return fallback || null;
  }
}

async function createResourceType({ key, label, icon = '', orderIndex = 0 }) {
  const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
  const res = await query(
    `INSERT INTO resource_types (key, label, icon, order_index, is_active)
     VALUES ($1, $2, $3, $4, TRUE)
     ON CONFLICT (key) DO UPDATE
     SET label = EXCLUDED.label, icon = EXCLUDED.icon, order_index = EXCLUDED.order_index, is_active = TRUE
     RETURNING id, key, label, icon, order_index, is_active, created_at;`,
    [cleanKey, label, icon, orderIndex]
  );
  return res.rows[0];
}

async function updateResourceType(key, { label, icon, orderIndex, isActive }) {
  const cleanKey = key.trim().toLowerCase();
  const current = await getResourceTypeByKey(cleanKey);
  if (!current) return null;

  const newLabel = label !== undefined ? label : current.label;
  const newIcon = icon !== undefined ? icon : (current.icon || '');
  const newOrder = orderIndex !== undefined ? orderIndex : (current.order_index || 0);
  const newActive = isActive !== undefined ? isActive : current.is_active;

  const res = await query(
    `UPDATE resource_types
     SET label = $1, icon = $2, order_index = $3, is_active = $4
     WHERE LOWER(key) = $5
     RETURNING id, key, label, icon, order_index, is_active, created_at;`,
    [newLabel, newIcon, newOrder, newActive, cleanKey]
  );
  return res.rows[0] || null;
}

async function deleteResourceType(key) {
  const cleanKey = key.trim().toLowerCase();
  const res = await query(
    `DELETE FROM resource_types
     WHERE LOWER(key) = $1
     RETURNING id, key, label;`,
    [cleanKey]
  );
  return res.rows[0] || null;
}

module.exports = {
  getAllResourceTypes,
  getResourceTypeByKey,
  createResourceType,
  updateResourceType,
  deleteResourceType,
  defaultResourceTypes
};
