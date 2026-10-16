const express = require('express');
const router = express.Router();

const { getAllCourses, getCourseById, getCoursesByLevelAndSemester, getTopicsByCourseId } = require('../../services/courseService');
const { getResourcesByCourse, getResourcesByBeyondCategory, searchResources, getResourceById, incrementDownloadCount, saveResourceBookmark, getSavedResources } = require('../../services/resourceService');
const { createRequest, getPendingRequests, getUserRequests, updateRequestStatus } = require('../../services/requestService');
const { getRecentAnnouncements, createAnnouncement } = require('../../services/announcementService');
const { getPlatformStats } = require('../../services/statsService');
const { beyondCategories } = require('../../bot/keyboards/beyond');

// 1. Courses Endpoints
router.get('/courses', async (req, res, next) => {
  try {
    const { level, semester } = req.query;
    if (level && semester) {
      const courses = await getCoursesByLevelAndSemester(parseInt(level, 10), parseInt(semester, 10));
      return res.json({ success: true, count: courses.length, data: courses });
    }
    const courses = await getAllCourses(level ? parseInt(level, 10) : null);
    return res.json({ success: true, count: courses.length, data: courses });
  } catch (err) {
    next(err);
  }
});

router.get('/courses/:id', async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const course = await getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
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

// 2. Resources Endpoints
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

// 3. Beyond Curriculum Categories
router.get('/beyond-categories', (req, res) => {
  return res.json({ success: true, data: beyondCategories });
});

// 4. Resource Requests
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

// 5. Saved Resources (Bookmarks)
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

// 6. Announcements
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

// 7. Platform Statistics
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getPlatformStats();
    return res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
