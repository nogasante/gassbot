const { query } = require('../config/database');

async function getCoursesByLevelAndSemester(level, semester) {
  const res = await query(
    `SELECT id, code, title, level, semester, description, is_active
     FROM courses
     WHERE level = $1 AND semester = $2 AND is_active = TRUE
     ORDER BY code ASC;`,
    [level, semester]
  );
  return res.rows;
}

async function getCourseById(courseId) {
  const res = await query(
    `SELECT id, code, title, level, semester, description, is_active
     FROM courses
     WHERE id = $1;`,
    [courseId]
  );
  return res.rows[0] || null;
}

async function getCourseByCode(code) {
  if (!code) return null;
  const trimmed = code.trim();
  const cleanCode = trimmed.replace(/\s+/g, '');
  const spaced = cleanCode.replace(/^([A-Za-z]+)(\d+)$/, '$1 $2');

  const res = await query(
    `SELECT id, code, title, level, semester, description, is_active
     FROM courses
     WHERE UPPER(code) = UPPER($1) OR UPPER(code) = UPPER($2) OR UPPER(code) = UPPER($3)
     LIMIT 1;`,
    [trimmed, cleanCode, spaced]
  );
  return res.rows[0] || null;
}

async function getAllCourses(level = null, { activeOnly = true } = {}) {
  let q = `
    SELECT id, code, title, level, semester, description, is_active
    FROM courses
  `;
  const conditions = [];
  const params = [];

  if (level !== null && level !== undefined) {
    params.push(level);
    conditions.push(`level = $${params.length}`);
  }

  if (activeOnly) {
    conditions.push(`is_active = TRUE`);
  }

  if (conditions.length > 0) {
    q += ` WHERE ` + conditions.join(' AND ');
  }

  q += ` ORDER BY level ASC, semester ASC, code ASC;`;

  const res = await query(q, params);
  return res.rows;
}

async function getTopicsByCourseId(courseId) {
  const res = await query(
    `SELECT id, course_id, title, description, order_index
     FROM topics
     WHERE course_id = $1
     ORDER BY order_index ASC, id ASC;`,
    [courseId]
  );
  return res.rows;
}

async function getDistinctLevels() {
  try {
    const res = await query(
      `SELECT DISTINCT level
       FROM courses
       WHERE is_active = TRUE
       ORDER BY level ASC;`
    );
    if (res.rows && res.rows.length > 0) {
      return res.rows.map(r => r.level);
    }
    return [100, 200, 300, 400];
  } catch (err) {
    console.warn('Error fetching distinct levels from DB:', err.message);
    return [100, 200, 300, 400];
  }
}

async function createCourse({ code, title, level, semester, description }) {
  const res = await query(
    `INSERT INTO courses (code, title, level, semester, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, code, title, level, semester, description, is_active, created_at;`,
    [code, title, level, semester, description]
  );
  return res.rows[0];
}

async function updateCourse(id, { code, title, level, semester, description, isActive }) {
  const current = await getCourseById(id);
  if (!current) return null;

  const newCode = code !== undefined ? code : current.code;
  const newTitle = title !== undefined ? title : current.title;
  const newLevel = level !== undefined ? level : current.level;
  const newSem = semester !== undefined ? semester : current.semester;
  const newDesc = description !== undefined ? description : current.description;
  const newActive = isActive !== undefined ? isActive : current.is_active;

  const res = await query(
    `UPDATE courses
     SET code = $1, title = $2, level = $3, semester = $4, description = $5, is_active = $6
     WHERE id = $7
     RETURNING id, code, title, level, semester, description, is_active, created_at;`,
    [newCode, newTitle, newLevel, newSem, newDesc, newActive, id]
  );
  return res.rows[0] || null;
}

async function deleteCourse(id) {
  const res = await query(
    `DELETE FROM courses
     WHERE id = $1
     RETURNING id, code, title;`,
    [id]
  );
  return res.rows[0] || null;
}

module.exports = {
  getCoursesByLevelAndSemester,
  getCourseById,
  getCourseByCode,
  getAllCourses,
  getTopicsByCourseId,
  getDistinctLevels,
  createCourse,
  updateCourse,
  deleteCourse
};
