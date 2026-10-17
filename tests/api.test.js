const request = require('supertest');
const { expect } = require('chai');
const { setupTestDb, seedTestDb } = require('./helpers/testDb');
const { createServer } = require('../src/api/server');

describe('GASS REST API Endpoints', () => {
  let app;
  let pool;

  before(async () => {
    pool = await setupTestDb();
    await seedTestDb(pool);
    app = createServer(null);
  });

  describe('GET /health', () => {
    it('should return health status, slogan, and metadata', async () => {
      const res = await request(app).get('/health');
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('ok');
      expect(res.body.slogan).to.equal('Statistics for Development');
      expect(res.body.service).to.equal('GASS-KNUST');
    });
  });

  describe('GET /api/courses', () => {
    it('should list all courses', async () => {
      const res = await request(app).get('/api/courses');
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.count).to.be.at.least(1);
    });

    it('should filter courses by level and semester', async () => {
      const res = await request(app).get('/api/courses?level=100&semester=1');
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      const codes = res.body.data.map(c => c.code);
      expect(codes).to.include('MATH 171');
    });
  });

  describe('GET /api/courses/:id', () => {
    it('should get course details with topics and resources', async () => {
      const listRes = await request(app).get('/api/courses?level=100&semester=1');
      const courseId = listRes.body.data[0].id;

      const res = await request(app).get(`/api/courses/${courseId}`);
      expect(res.status).to.equal(200);
      expect(res.body.data.id).to.equal(courseId);
      expect(res.body.data.topics).to.be.an('array');
      expect(res.body.data.resources).to.be.an('array');
    });

    it('should return 404 for non-existent course', async () => {
      const res = await request(app).get('/api/courses/99999');
      expect(res.status).to.equal(404);
      expect(res.body.success).to.be.false;
    });
  });

  describe('GET /api/resources', () => {
    it('should filter resources by beyond_category', async () => {
      const res = await request(app).get('/api/resources?beyond_category=r');
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.length).to.be.at.least(1);
    });

    it('should search resources by query term', async () => {
      const res = await request(app).get('/api/resources?search=Statistics');
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.length).to.be.at.least(1);
    });
  });

  describe('GET /api/beyond-categories', () => {
    it('should list all Beyond Curriculum categories', async () => {
      const res = await request(app).get('/api/beyond-categories');
      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an('array');
      const keys = res.body.data.map(c => c.key);
      expect(keys).to.include('programming_tools');
      expect(keys).to.include('data_science_ml');
      expect(keys).to.include('careers_opportunities');
      expect(keys).to.include('research_thesis');
    });

    it('should list sub-topics under a core pillar', async () => {
      const res = await request(app).get('/api/beyond-categories/programming_tools/sub-topics');
      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an('array');
      const keys = res.body.data.map(s => s.key);
      expect(keys).to.include('r');
      expect(keys).to.include('python');
    });
  });

  describe('Resource Requests Endpoints', () => {
    let createdRequestId;
    let studentUserId;

    before(async () => {
      // Create a student user for foreign key constraint
      const userRes = await pool.query(
        `INSERT INTO users (telegram_id, username, first_name, role)
         VALUES (888999, 'student_test', 'Amina', 'student')
         RETURNING id;`
      );
      studentUserId = userRes.rows[0].id;
    });

    it('should submit a resource request via POST /api/requests', async () => {
      const res = await request(app)
        .post('/api/requests')
        .send({
          userId: studentUserId,
          courseCode: 'STAT 353',
          topicTitle: 'Markov Chains',
          details: 'Looking for 2023 tutorial solution sheets'
        });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data.id).to.exist;
      expect(res.body.data.status).to.equal('pending');
      createdRequestId = res.body.data.id;
    });

    it('should retrieve pending requests via GET /api/requests', async () => {
      const res = await request(app).get('/api/requests');
      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.some(r => r.id === createdRequestId)).to.be.true;
    });

    it('should retrieve user-specific requests via GET /api/requests?userId=', async () => {
      const res = await request(app).get(`/api/requests?userId=${studentUserId}`);
      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.some(r => r.id === createdRequestId)).to.be.true;
    });

    it('should moderate request status via PATCH /api/requests/:id', async () => {
      const res = await request(app)
        .patch(`/api/requests/${createdRequestId}`)
        .send({
          status: 'approved',
          adminNotes: 'Resource acquired and approved for upload.'
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.status).to.equal('approved');
      expect(res.body.data.admin_notes).to.include('Resource acquired');
    });

    it('should reject invalid status with 400', async () => {
      const res = await request(app)
        .patch(`/api/requests/${createdRequestId}`)
        .send({ status: 'invalid_status_xyz' });

      expect(res.status).to.equal(400);
    });
  });

  describe('Bookmarks & Saved Resources', () => {
    let studentId;
    let resourceId;

    before(async () => {
      const u = await pool.query("SELECT id FROM users LIMIT 1;");
      studentId = u.rows[0].id;
      const r = await pool.query("SELECT id FROM resources LIMIT 1;");
      resourceId = r.rows[0].id;
    });

    it('should bookmark a resource via POST /api/resources/bookmark', async () => {
      const res = await request(app)
        .post('/api/resources/bookmark')
        .send({ userId: studentId, resourceId });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
    });

    it('should retrieve bookmarked resources via GET /api/resources/saved/:userId', async () => {
      const res = await request(app).get(`/api/resources/saved/${studentId}`);
      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.some(r => r.id === resourceId)).to.be.true;
    });
  });

  describe('Announcements API', () => {
    it('should create an announcement via POST /api/announcements', async () => {
      const res = await request(app)
        .post('/api/announcements')
        .send({
          title: 'GASS Data Hackathon Registration Open',
          content: 'Register your teams of 3 for the annual Statistics hackathon!',
          priority: 'event',
          targetLevel: null
        });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data.title).to.include('Hackathon');
    });

    it('should retrieve announcements via GET /api/announcements', async () => {
      const res = await request(app).get('/api/announcements');
      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.at.least(1);
    });
  });

  describe('GET /api/stats', () => {
    it('should retrieve platform metrics', async () => {
      const res = await request(app).get('/api/stats');
      expect(res.status).to.equal(200);
      expect(res.body.data.totalCourses).to.be.at.least(1);
      expect(res.body.data.totalResources).to.be.at.least(1);
    });
  });

  describe('POST /webhook (Telegram Webhook Mode)', () => {
    it('should correctly deserialize incoming update via express.json without 500 error', async () => {
      const { createBot } = require('../src/bot');
      const { config } = require('../src/config');
      const originalMode = config.botMode;
      config.botMode = 'webhook';

      const bot = createBot('123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11');
      bot.botInfo = {
        id: 123456,
        is_bot: true,
        first_name: 'GASSBot',
        username: 'gassbot',
        can_join_groups: true,
        can_read_all_group_messages: false,
        supports_inline_queries: false,
        can_connect_to_business: false,
        has_main_web_app: false
      };
      let receivedUpdate = null;
      bot.handleUpdate = async (update) => {
        receivedUpdate = update;
      };

      const webhookApp = createServer(bot);
      const res = await request(webhookApp)
        .post('/webhook')
        .send({
          update_id: 998877,
          message: {
            message_id: 1,
            from: { id: 111, first_name: 'Student' },
            chat: { id: 111, type: 'private' },
            text: '/start'
          }
        });

      expect(res.status).to.equal(200);
      expect(receivedUpdate).to.exist;
      expect(receivedUpdate.update_id).to.equal(998877);

      config.botMode = originalMode;
    });
  });
});
