const request = require('supertest');
const { expect } = require('chai');
const { setupTestDb, seedTestDb } = require('./helpers/testDb');
const { createServer } = require('../src/api/server');

const categoryService = require('../src/services/categoryService');
const resourceTypeService = require('../src/services/resourceTypeService');
const settingsService = require('../src/services/settingsService');
const courseService = require('../src/services/courseService');
const resourceService = require('../src/services/resourceService');

const {
  getAdminPanelKeyboard,
  getManageCoursesKeyboard,
  getManageCategoriesKeyboard,
  getManageResourceTypesKeyboard
} = require('../src/bot/keyboards/admin');
const { getLevelsKeyboard, getCourseActionKeyboard } = require('../src/bot/keyboards/academic');
const { getBeyondCategoriesKeyboard } = require('../src/bot/keyboards/beyond');

describe('Dynamic PostgreSQL Management & Hardcoding Elimination', () => {
  let app;
  let pool;

  before(async () => {
    pool = await setupTestDb();
    await seedTestDb(pool);
    app = createServer(null);
  });

  describe('Dynamic Beyond Categories Service & Endpoints', () => {
    it('should list all categories from database via service', async () => {
      const cats = await categoryService.getAllBeyondCategories();
      expect(cats).to.be.an('array');
      expect(cats.length).to.equal(4);
      const keys = cats.map(c => c.key);
      expect(keys).to.include('programming_tools');
      expect(keys).to.include('data_science_ml');
    });

    it('should fetch category by key case-insensitively', async () => {
      const cat = await categoryService.getBeyondCategoryByKey('R');
      expect(cat).to.exist;
      expect(cat.key).to.equal('r');
      expect(cat.label).to.include('R Programming');
    });

    it('should create a new category via REST API POST /api/beyond-categories', async () => {
      const res = await request(app)
        .post('/api/beyond-categories')
        .send({
          key: 'julia_stats',
          label: '🟣 Julia for Statistics',
          description: 'High-performance scientific computing',
          icon: '🟣',
          orderIndex: 20
        });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data.key).to.equal('julia_stats');
      expect(res.body.data.label).to.equal('🟣 Julia for Statistics');
    });

    it('should update a category via REST API PATCH /api/beyond-categories/:key', async () => {
      const res = await request(app)
        .patch('/api/beyond-categories/julia_stats')
        .send({
          label: '🟣 Julia & Scientific ML',
          description: 'Updated description for Julia'
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.label).to.equal('🟣 Julia & Scientific ML');
      expect(res.body.data.description).to.equal('Updated description for Julia');
    });

    it('should delete a category via REST API DELETE /api/beyond-categories/:key', async () => {
      const res = await request(app).delete('/api/beyond-categories/julia_stats');
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;

      const deletedCheck = await request(app).patch('/api/beyond-categories/julia_stats').send({ label: 'test' });
      expect(deletedCheck.status).to.equal(404);
    });

    it('should reject category creation with missing fields with 400', async () => {
      const res = await request(app)
        .post('/api/beyond-categories')
        .send({ key: 'only_key' });
      expect(res.status).to.equal(400);
    });
  });

  describe('Dynamic Resource Types Service & Endpoints', () => {
    it('should retrieve all resource types from database via service', async () => {
      const types = await resourceTypeService.getAllResourceTypes();
      expect(types).to.be.an('array');
      expect(types.length).to.be.at.least(6);
      const keys = types.map(t => t.key);
      expect(keys).to.include('past_question');
      expect(keys).to.include('lecture_slide');
    });

    it('should get resource type by key case-insensitively', async () => {
      const type = await resourceTypeService.getResourceTypeByKey('NOTE');
      expect(type).to.exist;
      expect(type.key).to.equal('note');
    });

    it('should list resource types via GET /api/resource-types', async () => {
      const res = await request(app).get('/api/resource-types');
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.count).to.be.at.least(6);
    });

    it('should create a new resource type via POST /api/resource-types', async () => {
      const res = await request(app)
        .post('/api/resource-types')
        .send({
          key: 'formula_sheet',
          label: '📑 Formula Cheat Sheet',
          icon: '📑',
          orderIndex: 7
        });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data.key).to.equal('formula_sheet');
    });

    it('should update resource type via PATCH /api/resource-types/:key', async () => {
      const res = await request(app)
        .patch('/api/resource-types/formula_sheet')
        .send({
          label: '📑 Quick Reference Formula Sheet'
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.label).to.equal('📑 Quick Reference Formula Sheet');
    });

    it('should delete resource type via DELETE /api/resource-types/:key', async () => {
      const res = await request(app).delete('/api/resource-types/formula_sheet');
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;

      const nonExistent = await request(app).delete('/api/resource-types/formula_sheet');
      expect(nonExistent.status).to.equal(404);
    });

    it('should reject invalid resource type creation with 400', async () => {
      const res = await request(app)
        .post('/api/resource-types')
        .send({ key: '' });
      expect(res.status).to.equal(400);
    });
  });

  describe('Dynamic Course Management Service & Endpoints', () => {
    let createdCourseId;

    it('should get distinct levels from courses table', async () => {
      const levels = await courseService.getDistinctLevels();
      expect(levels).to.be.an('array');
      expect(levels).to.include(100);
      expect(levels).to.include(200);
      expect(levels).to.include(300);
      expect(levels).to.include(400);
    });

    it('should create a course via POST /api/courses', async () => {
      const res = await request(app)
        .post('/api/courses')
        .send({
          code: 'STAT 499',
          title: 'Advanced Machine Learning in Biostatistics',
          level: 400,
          semester: 2,
          description: 'Genomics, clinical trial analysis, and biomarker discovery.'
        });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data.code).to.equal('STAT 499');
      createdCourseId = res.body.data.id;
    });

    it('should update a course via PATCH /api/courses/:id', async () => {
      const res = await request(app)
        .patch(`/api/courses/${createdCourseId}`)
        .send({
          title: 'Advanced Machine Learning in Biostatistics (Honors)',
          description: 'Updated comprehensive description.'
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.title).to.include('Honors');
    });

    it('should delete a course via DELETE /api/courses/:id', async () => {
      const res = await request(app).delete(`/api/courses/${createdCourseId}`);
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;

      const check = await request(app).get(`/api/courses/${createdCourseId}`);
      expect(check.status).to.equal(404);
    });

    it('should reject course creation with missing fields with 400', async () => {
      const res = await request(app)
        .post('/api/courses')
        .send({ code: 'STAT 999' });
      expect(res.status).to.equal(400);
    });
  });

  describe('Dynamic Resources Management Endpoints', () => {
    let testResourceId;

    it('should create a resource via POST /api/resources', async () => {
      const res = await request(app)
        .post('/api/resources')
        .send({
          title: 'Introductory R Practice Notebook',
          description: 'Hands-on notebook for R fundamentals',
          resourceType: 'code_repo',
          category: 'beyond_curriculum',
          beyondCategory: 'r',
          fileUrl: 'https://github.com/gass-knust/r-intro',
          fileFormat: 'link'
        });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data.title).to.equal('Introductory R Practice Notebook');
      testResourceId = res.body.data.id;
    });

    it('should update a resource via PATCH /api/resources/:id', async () => {
      const res = await request(app)
        .patch(`/api/resources/${testResourceId}`)
        .send({
          title: 'Updated Introductory R Practice Notebook v2'
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.title).to.equal('Updated Introductory R Practice Notebook v2');
    });

    it('should delete a resource via DELETE /api/resources/:id', async () => {
      const res = await request(app).delete(`/api/resources/${testResourceId}`);
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;

      const check = await request(app).get(`/api/resources/${testResourceId}`);
      expect(check.status).to.equal(404);
    });

    it('should reject resource creation with missing fields with 400', async () => {
      const res = await request(app)
        .post('/api/resources')
        .send({ title: 'Only Title' });
      expect(res.status).to.equal(400);
    });
  });

  describe('Application Settings & Constants Management', () => {
    it('should retrieve all settings and brand configuration via GET /api/settings', async () => {
      const res = await request(app).get('/api/settings');
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.brand).to.exist;
      expect(res.body.brand.slogan).to.equal('Statistics for Development');
    });

    it('should set and update a setting via POST /api/settings', async () => {
      const res = await request(app)
        .post('/api/settings')
        .send({
          key: 'custom_support_desk',
          value: '@gass_academic_team',
          description: 'Dedicated team support handle'
        });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data.key).to.equal('custom_support_desk');
      expect(res.body.data.value).to.equal('@gass_academic_team');
    });

    it('should retrieve individual setting via settingsService.getSetting', async () => {
      const val = await settingsService.getSetting('custom_support_desk');
      expect(val).to.equal('@gass_academic_team');

      const fallback = await settingsService.getSetting('non_existent_key', 'fallback_val');
      expect(fallback).to.equal('fallback_val');
    });
  });

  describe('Dynamic Telegram Bot Keyboards & Components', () => {
    it('should generate admin panel keyboard with course, category, and type management options', () => {
      const adminKb = getAdminPanelKeyboard();
      const buttons = adminKb.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'admin_manage_courses')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'admin_manage_categories')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'admin_manage_types')).to.be.true;
    });

    it('should generate course management keyboard with dynamic level buttons', () => {
      const kb = getManageCoursesKeyboard([100, 200, 300, 400]);
      const buttons = kb.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'admin_course_add')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'admin_crs_lvl_100')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'admin_crs_lvl_400')).to.be.true;
    });

    it('should generate category management keyboard with category list', () => {
      const testCategories = [
        { key: 'python', label: '🐍 Python', is_active: true },
        { key: 'sql', label: '🗄️ SQL', is_active: false }
      ];
      const kb = getManageCategoriesKeyboard(testCategories);
      const buttons = kb.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'admin_cat_add')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'admin_cat_view_python')).to.be.true;
      expect(buttons.some(b => b.text.includes('✅'))).to.be.true;
      expect(buttons.some(b => b.text.includes('⏸️'))).to.be.true;
    });

    it('should generate resource type management keyboard', () => {
      const testTypes = [
        { key: 'past_question', label: '📑 Past Question', is_active: true }
      ];
      const kb = getManageResourceTypesKeyboard(testTypes);
      const buttons = kb.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'admin_type_add')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'admin_type_view_past_question')).to.be.true;
    });

    it('should generate academic levels keyboard with custom or dynamic level numbers', () => {
      const kb = getLevelsKeyboard([100, 200, 300, 400, 500]);
      const buttons = kb.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'acad_lvl_500')).to.be.true;
    });

    it('should generate dynamic course action keyboard with custom resource types', () => {
      const customTypes = [
        { key: 'exam_review', label: '📝 Exam Review' },
        { key: 'lab_code', label: '💻 Lab Code' }
      ];
      const kb = getCourseActionKeyboard(12, 100, 1, customTypes);
      const buttons = kb.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'res_type_12_exam_review')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'res_type_12_lab_code')).to.be.true;
    });

    it('should generate beyond keyboard dynamically when passed custom categories', () => {
      const customCats = [
        { key: 'quantum_stats', label: '⚛️ Quantum Statistics' }
      ];
      const kb = getBeyondCategoriesKeyboard(customCats);
      const buttons = kb.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'beyond_pillar_quantum_stats')).to.be.true;
    });

    it('should support inactive courses in courseService and GET /api/courses?all=true', async () => {
      // Create a course and deactivate it
      const newCourse = await courseService.createCourse({
        code: 'TEST 101',
        title: 'Temporary Test Course',
        level: 100,
        semester: 1,
        description: 'Test'
      });
      await courseService.updateCourse(newCourse.id, { isActive: false });

      // activeOnly = true (default) should not include it
      const activeCourses = await courseService.getAllCourses(100);
      expect(activeCourses.some(c => c.id === newCourse.id)).to.be.false;

      // activeOnly = false should include it
      const allCourses = await courseService.getAllCourses(100, { activeOnly: false });
      expect(allCourses.some(c => c.id === newCourse.id)).to.be.true;

      // API route should also return it with all=true
      const apiRes = await request(app).get('/api/courses?level=100&all=true');
      expect(apiRes.status).to.equal(200);
      expect(apiRes.body.data.some(c => c.id === newCourse.id)).to.be.true;

      // Clean up
      await courseService.deleteCourse(newCourse.id);
    });

    it('should dynamically reflect updated brand slogan in /health endpoint', async () => {
      await settingsService.setSetting('brand_slogan', 'Data Drives Tomorrow');
      const res = await request(app).get('/health');
      expect(res.status).to.equal(200);
      expect(res.body.slogan).to.equal('Data Drives Tomorrow');

      // Reset back to original
      await settingsService.setSetting('brand_slogan', 'Statistics for Development');
    });

    it('should use dynamic brand info in announcement broadcasts', async () => {
      const announcementService = require('../src/services/announcementService');
      const userService = require('../src/services/userService');

      // Create test user so broadcast has a recipient
      await userService.findOrCreateUser({
        telegramId: 555666777,
        firstName: 'Amina',
        lastName: 'Appiah'
      });

      let sentMessage = null;
      const mockBot = {
        api: {
          sendMessage: async (id, text) => {
            sentMessage = text;
          }
        }
      };

      const announcement = await announcementService.createAnnouncement({
        title: 'New Library Books',
        content: 'Check out new statistics books.',
        priority: 'normal'
      });

      await announcementService.broadcastAnnouncement(mockBot, announcement);
      expect(sentMessage).to.exist;
      expect(sentMessage).to.include('Statistics for Development');
      expect(sentMessage).to.include('ANNOUNCEMENT');
    });
  });
});
