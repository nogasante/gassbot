const { query } = require('../config/database');

async function getPlatformStats() {
  const usersRes = await query('SELECT COUNT(*) as count FROM users;');
  const coursesRes = await query('SELECT COUNT(*) as count FROM courses WHERE is_active = TRUE;');
  const resourcesRes = await query('SELECT COUNT(*) as count, COALESCE(SUM(download_count), 0) as total_downloads FROM resources WHERE is_approved = TRUE;');
  const pendingRequestsRes = await query("SELECT COUNT(*) as count FROM resource_requests WHERE status = 'pending';");
  const announcementsRes = await query('SELECT COUNT(*) as count FROM announcements;');

  return {
    totalStudents: parseInt(usersRes.rows[0].count, 10),
    totalCourses: parseInt(coursesRes.rows[0].count, 10),
    totalResources: parseInt(resourcesRes.rows[0].count, 10),
    totalDownloads: parseInt(resourcesRes.rows[0].total_downloads, 10),
    pendingRequests: parseInt(pendingRequestsRes.rows[0].count, 10),
    totalAnnouncements: parseInt(announcementsRes.rows[0].count, 10)
  };
}

module.exports = {
  getPlatformStats
};
