const { expect } = require('chai');
const { setupTestDb, seedTestDb } = require('./helpers/testDb');

const userService = require('../src/services/userService');
const courseService = require('../src/services/courseService');
const resourceService = require('../src/services/resourceService');
const requestService = require('../src/services/requestService');
const announcementService = require('../src/services/announcementService');
const statsService = require('../src/services/statsService');
const aiService = require('../src/services/aiService');

describe('GASS Services (Shared Business Logic)', () => {
  let pool;

  before(async () => {
    pool = await setupTestDb();
    await seedTestDb(pool);
  });

  describe('User Service', () => {
    it('should create a new student profile on first interaction', async () => {
      const user = await userService.findOrCreateUser({
        telegramId: 111222333,
        username: 'stat_scholar',
        firstName: 'Kwame',
        lastName: 'Mensah',
        role: 'student'
      });

      expect(user).to.exist;
      expect(Number(user.telegram_id)).to.equal(111222333);
      expect(user.username).to.equal('stat_scholar');
      expect(user.notifications_enabled).to.be.true;
    });

    it('should update academic level preference for a student', async () => {
      const updated = await userService.updateAcademicLevel(111222333, 200);
      expect(updated.academic_level).to.equal(200);

      const resetAll = await userService.updateAcademicLevel(111222333, null);
      expect(resetAll.academic_level).to.be.null;

      // Re-set to 200 for subsequent tests
      await userService.updateAcademicLevel(111222333, 200);
    });

    it('should toggle notifications on/off', async () => {
      const muted = await userService.toggleNotifications(111222333, false);
      expect(muted.notifications_enabled).to.be.false;

      const enabled = await userService.toggleNotifications(111222333, true);
      expect(enabled.notifications_enabled).to.be.true;
    });

    it('should fetch subscribed users filtered by target level', async () => {
      const subscribers = await userService.getSubscribedUsers(200);
      expect(subscribers).to.be.an('array');
      expect(subscribers.some(u => Number(u.telegram_id) === 111222333)).to.be.true;
    });
  });

  describe('Course Service', () => {
    it('should retrieve courses by level and semester', async () => {
      const courses = await courseService.getCoursesByLevelAndSemester(100, 1);
      expect(courses).to.be.an('array');
      expect(courses.length).to.be.at.least(1);

      const math171 = courses.find(c => c.code === 'MATH 171');
      expect(math171).to.exist;
      expect(math171.title).to.equal('Calculus I');
    });

    it('should get course by code case-insensitively', async () => {
      const course = await courseService.getCourseByCode('math 171');
      expect(course).to.exist;
      expect(course.title).to.equal('Calculus I');
    });

    it('should retrieve topics belonging to a course', async () => {
      const course = await courseService.getCourseByCode('MATH 171');
      const topics = await courseService.getTopicsByCourseId(course.id);
      expect(topics).to.be.an('array');
      expect(topics.length).to.be.at.least(2);
      expect(topics[0].title).to.include('Limits');
    });
  });

  describe('Resource Service', () => {
    it('should fetch curriculum resources for a course', async () => {
      const course = await courseService.getCourseByCode('MATH 171');
      const resources = await resourceService.getResourcesByCourse(course.id);
      expect(resources).to.be.an('array');
      expect(resources.length).to.be.at.least(1);
    });

    it('should fetch Beyond Curriculum resources by category key', async () => {
      const rResources = await resourceService.getResourcesByBeyondCategory('r');
      expect(rResources).to.be.an('array');
      expect(rResources.length).to.be.at.least(1);
      expect(rResources[0].beyond_sub_topic || rResources[0].beyond_category).to.equal('r');
    });

    it('should search resources by keyword across titles and courses', async () => {
      const results = await resourceService.searchResources('MATH 171');
      expect(results).to.be.an('array');
      expect(results.length).to.be.at.least(1);
    });

    it('should increment download count on resource download', async () => {
      const rResources = await resourceService.getResourcesByBeyondCategory('r');
      const target = rResources[0];
      const initialCount = target.download_count;

      const updated = await resourceService.incrementDownloadCount(target.id);
      expect(updated.download_count).to.equal(initialCount + 1);
    });

    it('should bookmark and retrieve saved resources for a student', async () => {
      const user = await userService.getUserByTelegramId(111222333);
      const rResources = await resourceService.getResourcesByBeyondCategory('r');
      const target = rResources[0];

      const bookmark = await resourceService.saveResourceBookmark(user.id, target.id);
      expect(bookmark).to.exist;

      const saved = await resourceService.getSavedResources(user.id);
      expect(saved).to.be.an('array');
      expect(saved.some(s => s.id === target.id)).to.be.true;
    });
  });

  describe('Resource Request Service', () => {
    let createdReqId;

    it('should create a pending resource request', async () => {
      const user = await userService.getUserByTelegramId(111222333);
      const req = await requestService.createRequest({
        userId: user.id,
        courseCode: 'STAT 255',
        topicTitle: 'Heteroscedasticity Tests',
        details: 'Looking for 2023 solved exam questions with Breusch-Pagan test examples'
      });

      expect(req).to.exist;
      expect(req.status).to.equal('pending');
      createdReqId = req.id;
    });

    it('should list pending requests in admin queue', async () => {
      const pending = await requestService.getPendingRequests();
      expect(pending).to.be.an('array');
      const found = pending.find(p => p.id === createdReqId);
      expect(found).to.exist;
      expect(found.first_name).to.equal('Kwame');
    });

    it('should update request status and generate audit log', async () => {
      const user = await userService.getUserByTelegramId(111222333);
      const updated = await requestService.updateRequestStatus(createdReqId, {
        status: 'approved',
        adminNotes: 'Approved. Assigned to tech committee for upload.',
        resolvedByUserId: user.id
      });

      expect(updated.status).to.equal('approved');
      expect(updated.admin_notes).to.include('Approved');

      // Verify audit log
      const auditRes = await pool.query(
        "SELECT * FROM audit_logs WHERE action = 'REQUEST_APPROVED' AND entity_id = $1;",
        [createdReqId]
      );
      expect(auditRes.rows.length).to.equal(1);
    });
  });

  describe('Announcement Service', () => {
    it('should create an announcement', async () => {
      const announcement = await announcementService.createAnnouncement({
        title: 'Mid-Semester Exam Timetable Published',
        content: 'Check the departmental notice board and GASS portal for exam dates.',
        priority: 'urgent',
        targetLevel: 200
      });

      expect(announcement).to.exist;
      expect(announcement.title).to.include('Mid-Semester');
      expect(announcement.priority).to.equal('urgent');
    });

    it('should broadcast announcement via mock bot api', async () => {
      const announcements = await announcementService.getRecentAnnouncements({ limit: 1 });
      const target = announcements[0];

      let sentCount = 0;
      const mockBot = {
        api: {
          sendMessage: async (chatId, text) => {
            sentCount++;
            return { message_id: 1234 };
          }
        }
      };

      const result = await announcementService.broadcastAnnouncement(mockBot, target);
      expect(result.successCount).to.be.at.least(1);
      expect(sentCount).to.be.at.least(1);
    });
  });

  describe('Platform Stats Service', () => {
    it('should compute aggregated platform metrics', async () => {
      const stats = await statsService.getPlatformStats();
      expect(stats.totalStudents).to.be.at.least(1);
      expect(stats.totalCourses).to.be.at.least(1);
      expect(stats.totalResources).to.be.at.least(1);
      expect(stats.totalDownloads).to.be.at.least(1);
      expect(stats.totalAnnouncements).to.be.at.least(1);
    });
  });

  describe('AI Service', () => {
    it('should report availability status cleanly when model is dormant', async () => {
      const res = await aiService.askAcademicTutor({
        query: 'What is the Central Limit Theorem?',
        courseCode: 'STAT 152'
      });
      expect(res.available).to.be.false;
      expect(res.message).to.include('GASS Academic AI Tutor');
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('should return empty array when searching for non-existent terms', async () => {
      const results = await resourceService.searchResources('NonExistentTermXYZ12345');
      expect(results).to.be.an('array');
      expect(results.length).to.equal(0);
    });

    it('should return null when querying non-existent course id or code', async () => {
      const courseById = await courseService.getCourseById(999999);
      expect(courseById).to.be.null;

      const courseByCode = await courseService.getCourseByCode('UNKNOWN 999');
      expect(courseByCode).to.be.null;
    });

    it('should return empty array for semester with no courses', async () => {
      const courses = await courseService.getCoursesByLevelAndSemester(100, 3);
      expect(courses).to.be.an('array');
      expect(courses.length).to.equal(0);
    });

    it('should return empty array for non-existent beyond category', async () => {
      const res = await resourceService.getResourcesByBeyondCategory('non_existent_category');
      expect(res).to.be.an('array');
      expect(res.length).to.equal(0);
    });

    it('should return null for non-existent request id on status update', async () => {
      const updated = await requestService.updateRequestStatus(999999, { status: 'rejected' });
      expect(updated).to.be.null;
    });
  });
});
