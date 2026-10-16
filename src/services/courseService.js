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

async function getAllCourses(level = null) {
  if (level) {
    const res = await query(
      `SELECT id, code, title, level, semester, description, is_active
       FROM courses
       WHERE level = $1 AND is_active = TRUE
       ORDER BY semester ASC, code ASC;`,
      [level]
    );
    return res.rows;
  }
  const res = await query(
    `SELECT id, code, title, level, semester, description, is_active
     FROM courses
     WHERE is_active = TRUE
     ORDER BY level ASC, semester ASC, code ASC;`
  );
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

async function createCourse({ code, title, level, semester, description }) {
  const res = await query(
    `INSERT INTO courses (code, title, level, semester, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, code, title, level, semester, description, is_active, created_at;`,
    [code, title, level, semester, description]
  );
  return res.rows[0];
}

module.exports = {
  getCoursesByLevelAndSemester,
  getCourseById,
  getCourseByCode,
  getAllCourses,
  getTopicsByCourseId,
  createCourse
};
