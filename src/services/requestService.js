const { query } = require('../config/database');

async function createRequest({ userId, courseCode, topicTitle, details }) {
  const res = await query(
    `INSERT INTO resource_requests (user_id, course_code, topic_title, details, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING id, user_id, course_code, topic_title, details, status, created_at;`,
    [userId, courseCode, topicTitle, details]
  );
  return res.rows[0];
}

async function getPendingRequests({ limit = 20, offset = 0 } = {}) {
  const res = await query(
    `SELECT rr.id, rr.user_id, rr.course_code, rr.topic_title, rr.details, rr.status,
            rr.created_at, u.telegram_id, u.username, u.first_name, u.academic_level
     FROM resource_requests rr
     JOIN users u ON rr.user_id = u.id
     WHERE rr.status = 'pending'
     ORDER BY rr.created_at ASC
     LIMIT $1 OFFSET $2;`,
    [limit, offset]
  );
  return res.rows;
}

async function getRequestById(id) {
  const res = await query(
    `SELECT rr.id, rr.user_id, rr.course_code, rr.topic_title, rr.details, rr.status,
            rr.admin_notes, rr.created_at, rr.updated_at,
            u.telegram_id, u.username, u.first_name, u.academic_level
     FROM resource_requests rr
     JOIN users u ON rr.user_id = u.id
     WHERE rr.id = $1;`,
    [id]
  );
  return res.rows[0] || null;
}

async function updateRequestStatus(id, { status, adminNotes = null, resolvedByUserId = null }) {
  const res = await query(
    `UPDATE resource_requests
     SET status = $2,
         admin_notes = COALESCE($3, admin_notes),
         resolved_by = COALESCE($4, resolved_by),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, user_id, course_code, topic_title, details, status, admin_notes, resolved_by, updated_at;`,
    [id, status, adminNotes, resolvedByUserId]
  );

  const updatedRequest = res.rows[0] || null;

  if (updatedRequest) {
    // Record audit log
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, 'resource_request', $3, $4);`,
      [
        resolvedByUserId,
        `REQUEST_${status.toUpperCase()}`,
        id,
        JSON.stringify({ status, adminNotes })
      ]
    );
  }

  return updatedRequest;
}

async function getUserRequests(userId) {
  const res = await query(
    `SELECT id, course_code, topic_title, details, status, admin_notes, created_at, updated_at
     FROM resource_requests
     WHERE user_id = $1
     ORDER BY created_at DESC;`,
    [userId]
  );
  return res.rows;
}

module.exports = {
  createRequest,
  getPendingRequests,
  getRequestById,
  updateRequestStatus,
  getUserRequests
};
