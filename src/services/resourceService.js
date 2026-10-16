const { query } = require('../config/database');

async function getResourcesByCourse(courseId, resourceType = null) {
  let q = `
    SELECT r.id, r.title, r.description, r.resource_type, r.category, r.course_id, r.topic_id,
           r.file_url, r.telegram_file_id, r.file_format, r.tags, r.download_count, r.created_at,
           c.code as course_code, c.title as course_title, t.title as topic_title
    FROM resources r
    LEFT JOIN courses c ON r.course_id = c.id
    LEFT JOIN topics t ON r.topic_id = t.id
    WHERE r.course_id = $1 AND r.is_approved = TRUE
  `;
  const params = [courseId];

  if (resourceType) {
    params.push(resourceType);
    q += ` AND r.resource_type = $2`;
  }

  q += ` ORDER BY r.resource_type ASC, r.title ASC;`;
  const res = await query(q, params);
  return res.rows;
}

async function getResourcesByBeyondCategory(beyondCategory) {
  const res = await query(
    `SELECT r.id, r.title, r.description, r.resource_type, r.category, r.beyond_category,
            r.file_url, r.telegram_file_id, r.file_format, r.tags, r.download_count, r.created_at
     FROM resources r
     WHERE r.category = 'beyond_curriculum' 
       AND LOWER(r.beyond_category) = LOWER($1)
       AND r.is_approved = TRUE
     ORDER BY r.title ASC;`,
    [beyondCategory]
  );
  return res.rows;
}

async function searchResources(searchTerm, limit = 20) {
  const formattedSearch = `%${searchTerm.trim()}%`;
  const res = await query(
    `SELECT r.id, r.title, r.description, r.resource_type, r.category, r.beyond_category,
            r.file_url, r.file_format, r.download_count,
            c.code as course_code, c.title as course_title, c.level as course_level
     FROM resources r
     LEFT JOIN courses c ON r.course_id = c.id
     WHERE r.is_approved = TRUE
       AND (
         r.title ILIKE $1
         OR r.description ILIKE $1
         OR c.code ILIKE $1
         OR c.title ILIKE $1
         OR r.beyond_category ILIKE $1
       )
     ORDER BY r.download_count DESC, r.created_at DESC
     LIMIT $2;`,
    [formattedSearch, limit]
  );
  return res.rows;
}

async function getResourceById(id) {
  const res = await query(
    `SELECT r.id, r.title, r.description, r.resource_type, r.category, r.beyond_category,
            r.course_id, r.topic_id, r.file_url, r.telegram_file_id, r.file_format,
            r.tags, r.download_count, r.created_at,
            c.code as course_code, c.title as course_title
     FROM resources r
     LEFT JOIN courses c ON r.course_id = c.id
     WHERE r.id = $1;`,
    [id]
  );
  return res.rows[0] || null;
}

async function incrementDownloadCount(id) {
  const res = await query(
    `UPDATE resources
     SET download_count = download_count + 1
     WHERE id = $1
     RETURNING id, download_count;`,
    [id]
  );
  return res.rows[0] || null;
}

async function createResource({
  title,
  description,
  resourceType,
  category,
  courseId = null,
  topicId = null,
  beyondCategory = null,
  fileUrl,
  telegramFileId = null,
  fileFormat = 'pdf',
  tags = []
}) {
  const res = await query(
    `INSERT INTO resources (
       title, description, resource_type, category, course_id, topic_id,
       beyond_category, file_url, telegram_file_id, file_format, tags
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id, title, resource_type, category, file_url, created_at;`,
    [
      title,
      description,
      resourceType,
      category,
      courseId,
      topicId,
      beyondCategory,
      fileUrl,
      telegramFileId,
      fileFormat,
      tags
    ]
  );
  return res.rows[0];
}

async function saveResourceBookmark(userId, resourceId) {
  const res = await query(
    `INSERT INTO saved_resources (user_id, resource_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, resource_id) DO NOTHING
     RETURNING id, user_id, resource_id, created_at;`,
    [userId, resourceId]
  );
  return res.rows[0] || null;
}

async function getSavedResources(userId) {
  const res = await query(
    `SELECT r.id, r.title, r.description, r.resource_type, r.category, r.file_url, r.file_format,
            c.code as course_code, c.title as course_title, sr.created_at as saved_at
     FROM saved_resources sr
     JOIN resources r ON sr.resource_id = r.id
     LEFT JOIN courses c ON r.course_id = c.id
     WHERE sr.user_id = $1
     ORDER BY sr.created_at DESC;`,
    [userId]
  );
  return res.rows;
}

module.exports = {
  getResourcesByCourse,
  getResourcesByBeyondCategory,
  searchResources,
  getResourceById,
  incrementDownloadCount,
  createResource,
  saveResourceBookmark,
  getSavedResources
};
