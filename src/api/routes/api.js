const express = require('express');
const router = express.Router();

const {
  getAllCourses,
  getCourseById,
  getCoursesByLevelAndSemester,
  getTopicsByCourseId,
  getDistinctLevels,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../../services/courseService');
const {
  getResourcesByCourse,
  getResourcesByBeyondCategory,
  searchResources,
  getResourceById,
  incrementDownloadCount,
  saveResourceBookmark,
  getSavedResources,
  createResource,
  updateResource,
  deleteResource
} = require('../../services/resourceService');
const {
  createRequest,
  getPendingRequests,
  getUserRequests,
  updateRequestStatus
} = require('../../services/requestService');
const {
  getRecentAnnouncements,
  createAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement
} = require('../../services/announcementService');
const { getPlatformStats } = require('../../services/statsService');
const {
  getAllBeyondCategories,
  getBeyondCategoryByKey,
  createBeyondCategory,
  updateBeyondCategory,
  deleteBeyondCategory,
  getSubTopicsByPillar,
  getAllSubTopics,
  createSubTopic,
  updateSubTopic,
  deleteSubTopic
} = require('../../services/categoryService');
const {
  getAllResourceTypes,
  getResourceTypeByKey,
  createResourceType,
  updateResourceType,
  deleteResourceType
} = require('../../services/resourceTypeService');
const {
  getAllSettings,
  getSetting,
  setSetting,
  getBrandConfig
} = require('../../services/settingsService');
const { validateTelegramWebAppData } = require('../middleware/telegramAuth');
const { findOrCreateUser } = require('../../services/userService');
const { config } = require('../../config');
const { query } = require('../../config/database');

// =======================================================
// Health Check Endpoint
// =======================================================
router.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    if (config.databaseUrl) {
      await query('SELECT 1;');
      dbStatus = 'connected';
    } else {
      dbStatus = 'not_configured';
    }
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  const brand = await getBrandConfig();

  return res.json({
    status: 'ok',
    service: brand.name,
    slogan: brand.slogan,
    mode: config.botMode,
    environment: config.env,
    database: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// =======================================================
// 0. Telegram Mini App Authentication Endpoint
// =======================================================
router.post('/auth/telegram', async (req, res, next) => {
  try {
    const { initData } = req.body;
    if (!initData) {
      return res.status(400).json({ success: false, error: 'initData is required' });
    }

    const validatedUser = validateTelegramWebAppData(initData);
    if (!validatedUser || !validatedUser.id) {
      return res.status(401).json({ success: false, error: 'Invalid Telegram WebApp authentication signature.' });
    }

    const dbUser = await findOrCreateUser({
      telegramId: validatedUser.id,
      username: validatedUser.username || null,
      firstName: validatedUser.first_name || '',
      lastName: validatedUser.last_name || ''
    });

    return res.json({
      success: true,
      user: {
        id: dbUser.id,
        telegramId: dbUser.telegram_id,
        username: dbUser.username,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        academicLevel: dbUser.academic_level,
        role: dbUser.role
      }
    });
  } catch (err) {
    next(err);
  }
});

// =======================================================
// 1. Courses Endpoints
// =======================================================
router.get('/courses', async (req, res, next) => {
  try {
    const { level, semester } = req.query;
    if (level && semester) {
      const courses = await getCoursesByLevelAndSemester(parseInt(level, 10), parseInt(semester, 10));
      return res.json({ success: true, count: courses.length, data: courses });
    }
    const courses = await getAllCourses(level ? parseInt(level, 10) : null, { activeOnly: req.query.all !== 'true' });
    return res.json({ success: true, count: courses.length, data: courses });
  } catch (err) {
    next(err);
  }
});

router.get('/courses/levels', async (req, res, next) => {
  try {
    const levels = await getDistinctLevels();
    return res.json({ success: true, count: levels.length, data: levels });
  } catch (err) {
    next(err);
  }
});

router.get('/courses/:id', async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const course = await getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.COntact executives for support.' });
    }
    const topics = await getTopicsByCourseId(courseId);
    const resources = await getResourcesByCourse(courseId);
    return res.json({
      success: true,
      data: {
        ...course,
        topics,
        resources
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/courses', async (req, res, next) => {
  try {
    const { code, title, level, semester, description } = req.body;
    if (!code || !title || !level || !semester) {
      return res.status(400).json({ success: false, error: 'code, title, level, and semester are required.' });
    }
    const course = await createCourse({
      code: code.trim().toUpperCase(),
      title: title.trim(),
      level: parseInt(level, 10),
      semester: parseInt(semester, 10),
      description: description || `${code} - ${title}`
    });
    return res.status(201).json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
});

router.patch('/courses/:id', async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const updated = await updateCourse(courseId, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/courses/:id', async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const deleted = await deleteCourse(courseId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    return res.json({ success: true, message: 'Course deleted successfully', data: deleted });
  } catch (err) {
    next(err);
  }
});

// =======================================================
// 2. Resources Endpoints
// =======================================================
router.get('/resources', async (req, res, next) => {
  try {
    const { course_id, beyond_category, search } = req.query;
    if (search) {
      const results = await searchResources(search);
      return res.json({ success: true, count: results.length, data: results });
    }
    if (beyond_category) {
      const results = await getResourcesByBeyondCategory(beyond_category);
      return res.json({ success: true, count: results.length, data: results });
    }
    if (course_id) {
      const results = await getResourcesByCourse(parseInt(course_id, 10));
      return res.json({ success: true, count: results.length, data: results });
    }
    return res.status(400).json({ success: false, error: 'Specify search, course_id, or beyond_category filter.' });
  } catch (err) {
    next(err);
  }
});

router.get('/resources/:id', async (req, res, next) => {
  try {
    const resourceId = parseInt(req.params.id, 10);
    const resource = await getResourceById(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }
    await incrementDownloadCount(resourceId);
    return res.json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
});

router.post('/resources/:id/send-telegram', async (req, res, next) => {
  try {
    const resourceId = parseInt(req.params.id, 10);
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }
    const resource = await getResourceById(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }

    const bot = req.app.get('bot');
    if (!bot) {
      return res.json({
        success: true,
        delivered: false,
        message: 'Bot instance not running in this environment. Material link preserved.'
      });
    }

    try {
      if (resource.telegram_file_id) {
        await bot.api.sendDocument(userId, resource.telegram_file_id, {
          caption: `📚 *${resource.title}*\n\n✅ Natively cached in your Telegram chat for offline study.`
        });
      } else {
        await bot.api.sendMessage(
          userId,
          `📚 *${resource.title}*\n━━━━━━━━━━━━━━━━━━\n${resource.description || 'Verified academic resource.'}\n\n🔗 *Access Link:* ${resource.file_url}\n\n💡 *Offline Tip:* Materials in your Telegram chat remain accessible offline!`,
          { parse_mode: 'Markdown' }
        );
      }
      return res.json({ success: true, delivered: true, message: 'Resource delivered to your Telegram chat' });
    } catch (telegramErr) {
      return res.json({
        success: true,
        delivered: false,
        message: `Could not send to Telegram chat: ${telegramErr.message}`
      });
    }
  } catch (err) {
    next(err);
  }
});

router.post('/resources', async (req, res, next) => {
  try {
    const {
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
    } = req.body;

    if (!title || !fileUrl) {
      return res.status(400).json({ success: false, error: 'title and fileUrl are required.' });
    }

    const created = await createResource({
      title,
      description: description || '',
      resourceType: resourceType || 'document',
      category: category || (courseId ? 'curriculum' : 'beyond_curriculum'),
      courseId: courseId ? parseInt(courseId, 10) : null,
      topicId: topicId ? parseInt(topicId, 10) : null,
      beyondCategory: beyondCategory || null,
      fileUrl,
      telegramFileId: telegramFileId || null,
      fileFormat: fileFormat || 'pdf',
      tags: tags || []
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
});

router.patch('/resources/:id', async (req, res, next) => {
  try {
    const resourceId = parseInt(req.params.id, 10);
    const updated = await updateResource(resourceId, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/resources/:id', async (req, res, next) => {
  try {
    const resourceId = parseInt(req.params.id, 10);
    const deleted = await deleteResource(resourceId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Resource not found' });
    }
    return res.json({ success: true, message: 'Resource deleted successfully', data: deleted });
  } catch (err) {
    next(err);
  }
});

// =======================================================
// 3. Beyond Curriculum Categories Endpoints (Dynamic DB Driven)
// =======================================================
router.get('/beyond-categories', async (req, res, next) => {
  try {
    const categories = await getAllBeyondCategories({ activeOnly: req.query.all !== 'true' });
    return res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    next(err);
  }
});

router.post('/beyond-categories', async (req, res, next) => {
  try {
    const { key, label, description, icon, orderIndex } = req.body;
    if (!key || !label) {
      return res.status(400).json({ success: false, error: 'key and label are required.' });
    }
    const created = await createBeyondCategory({
      key,
      label,
      description,
      icon,
      orderIndex: orderIndex ? parseInt(orderIndex, 10) : 0
    });
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
});

router.patch('/beyond-categories/:key', async (req, res, next) => {
  try {
    const updated = await updateBeyondCategory(req.params.key, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/beyond-categories/:key', async (req, res, next) => {
  try {
    const deleted = await deleteBeyondCategory(req.params.key);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    return res.json({ success: true, message: 'Category deleted successfully', data: deleted });
  } catch (err) {
    next(err);
  }
});

// Sub-topics under pillars
router.get('/beyond-categories/:key/sub-topics', async (req, res, next) => {
  try {
    const subTopics = await getSubTopicsByPillar(req.params.key, { activeOnly: req.query.all !== 'true' });
    return res.json({ success: true, count: subTopics.length, data: subTopics });
  } catch (err) {
    next(err);
  }
});

router.get('/beyond-sub-topics', async (req, res, next) => {
  try {
    const subTopics = await getAllSubTopics({ activeOnly: req.query.all !== 'true' });
    return res.json({ success: true, count: subTopics.length, data: subTopics });
  } catch (err) {
    next(err);
  }
});

router.post('/beyond-sub-topics', async (req, res, next) => {
  try {
    const { pillarKey, key, label, description, icon, orderIndex } = req.body;
    if (!pillarKey || !key || !label) {
      return res.status(400).json({ success: false, error: 'pillarKey, key, and label are required.' });
    }
    const created = await createSubTopic({
      pillarKey,
      key,
      label,
      description,
      icon,
      orderIndex: orderIndex ? parseInt(orderIndex, 10) : 0
    });
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
});

router.patch('/beyond-sub-topics/:key', async (req, res, next) => {
  try {
    const updated = await updateSubTopic(req.params.key, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Sub-topic not found' });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/beyond-sub-topics/:key', async (req, res, next) => {
  try {
    const deleted = await deleteSubTopic(req.params.key);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Sub-topic not found' });
    }
    return res.json({ success: true, message: 'Sub-topic deleted successfully', data: deleted });
  } catch (err) {
    next(err);
  }
});

// =======================================================
// 4. Resource Types Endpoints (Dynamic DB Driven)
// =======================================================
router.get('/resource-types', async (req, res, next) => {
  try {
    const types = await getAllResourceTypes({ activeOnly: req.query.all !== 'true' });
    return res.json({ success: true, count: types.length, data: types });
  } catch (err) {
    next(err);
  }
});

router.post('/resource-types', async (req, res, next) => {
  try {
    const { key, label, icon, orderIndex } = req.body;
    if (!key || !label) {
      return res.status(400).json({ success: false, error: 'key and label are required.' });
    }
    const created = await createResourceType({
      key,
      label,
      icon,
      orderIndex: orderIndex ? parseInt(orderIndex, 10) : 0
    });
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
});

router.patch('/resource-types/:key', async (req, res, next) => {
  try {
    const updated = await updateResourceType(req.params.key, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Resource type not found' });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/resource-types/:key', async (req, res, next) => {
  try {
    const deleted = await deleteResourceType(req.params.key);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Resource type not found' });
    }
    return res.json({ success: true, message: 'Resource type deleted successfully', data: deleted });
  } catch (err) {
    next(err);
  }
});

// =======================================================
// 5. Resource Requests
// =======================================================
router.post('/requests', async (req, res, next) => {
  try {
    const { userId, courseCode, topicTitle, details } = req.body;
    if (!userId || !details) {
      return res.status(400).json({ success: false, error: 'userId and details are required.' });
    }
    const request = await createRequest({ userId, courseCode, topicTitle, details });
    return res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

router.get('/requests', async (req, res, next) => {
  try {
    const { userId, status } = req.query;
    if (userId) {
      const requests = await getUserRequests(parseInt(userId, 10));
      return res.json({ success: true, count: requests.length, data: requests });
    }
    const requests = await getPendingRequests();
    return res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    next(err);
  }
});

router.get('/requests/pending', async (req, res, next) => {
  try {
    const requests = await getPendingRequests();
    return res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    next(err);
  }
});

router.patch('/requests/:id', async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const { status, adminNotes, resolvedByUserId } = req.body;
    if (!status || !['pending', 'approved', 'rejected', 'fulfilled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Valid status is required (pending, approved, rejected, fulfilled).' });
    }
    const updated = await updateRequestStatus(requestId, { status, adminNotes, resolvedByUserId });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// =======================================================
// 6. Saved Resources (Bookmarks)
// =======================================================
router.post('/resources/bookmark', async (req, res, next) => {
  try {
    const { userId, resourceId } = req.body;
    if (!userId || !resourceId) {
      return res.status(400).json({ success: false, error: 'userId and resourceId are required.' });
    }
    const bookmark = await saveResourceBookmark(parseInt(userId, 10), parseInt(resourceId, 10));
    return res.status(201).json({ success: true, data: bookmark });
  } catch (err) {
    next(err);
  }
});

router.get('/resources/saved/:userId', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const saved = await getSavedResources(userId);
    return res.json({ success: true, count: saved.length, data: saved });
  } catch (err) {
    next(err);
  }
});

// =======================================================
// 7. Announcements
// =======================================================
router.post('/announcements', async (req, res, next) => {
  try {
    const { authorId, title, content, priority, targetLevel } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'title and content are required.' });
    }
    const announcement = await createAnnouncement({
      authorId: authorId ? parseInt(authorId, 10) : null,
      title,
      content,
      priority: priority || 'normal',
      targetLevel: targetLevel ? parseInt(targetLevel, 10) : null
    });
    return res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    next(err);
  }
});

router.get('/announcements', async (req, res, next) => {
  try {
    const { level } = req.query;
    const announcements = await getRecentAnnouncements({
      targetLevel: level ? parseInt(level, 10) : null
    });
    return res.json({ success: true, count: announcements.length, data: announcements });
  } catch (err) {
    next(err);
  }
});

router.get('/announcements/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const announcement = await getAnnouncementById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }
    return res.json({ success: true, data: announcement });
  } catch (err) {
    next(err);
  }
});

router.patch('/announcements/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await updateAnnouncement(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/announcements/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await deleteAnnouncement(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }
    return res.json({ success: true, message: 'Announcement deleted successfully', data: deleted });
  } catch (err) {
    next(err);
  }
});

// =======================================================
// 8. Platform Statistics
// =======================================================
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getPlatformStats();
    return res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

// =======================================================
// 9. Application Settings & Constants Management
// =======================================================
router.get('/settings', async (req, res, next) => {
  try {
    const settings = await getAllSettings();
    const brand = await getBrandConfig();
    return res.json({ success: true, data: settings, brand });
  } catch (err) {
    next(err);
  }
});

router.post('/settings', async (req, res, next) => {
  try {
    const { key, value, description } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ success: false, error: 'key and value are required.' });
    }
    const saved = await setSetting(key, value, description);
    return res.status(201).json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
