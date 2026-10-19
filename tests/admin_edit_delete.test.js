const { expect } = require('chai');
const { setupTestDb, seedTestDb } = require('./helpers/testDb');
const courseService = require('../src/services/courseService');
const resourceService = require('../src/services/resourceService');
const categoryService = require('../src/services/categoryService');
const resourceTypeService = require('../src/services/resourceTypeService');
const announcementService = require('../src/services/announcementService');

const {
  getAdminPanelKeyboard,
  getCourseDetailsKeyboard,
  getResourceDetailsKeyboard,
  getCategoryDetailsKeyboard,
  getResourceTypeDetailsKeyboard,
  getConfirmDeleteKeyboard,
  getManageAnnouncementsKeyboard,
  getAnnouncementDetailsKeyboard,
  getConfirmDeleteAnnouncementKeyboard
} = require('../src/bot/keyboards/admin');

const {
  handleAdminCoursesByLevel,
  handleViewCourse,
  handleConfirmDeleteCourse,
  handleDeleteCourse,
  handleToggleCourseActive,
  handleManageResources,
  handleManageResourcesAcadLevels,
  handleManageResourcesCourses,
  handleManageResourcesListByCourse,
  handleManageResourcesBeyondCategories,
  handleManageResourcesListByBeyond,
  handleViewResource,
  handleConfirmDeleteResource,
  handleDeleteResource,
  handleViewCategory,
  handleConfirmDeleteCategory,
  handleDeleteCategory,
  handleToggleCategoryActive,
  handleViewResourceType,
  handleConfirmDeleteResourceType,
  handleDeleteResourceType,
  handleToggleResourceTypeActive,
  handleManageAnnouncements,
  handleViewAnnouncement,
  handleConfirmDeleteAnnouncement,
  handleDeleteAnnouncement
} = require('../src/bot/handlers/admin');

const {
  adminEditCourseTitleConversation,
  adminEditCourseCodeConversation,
  adminEditResourceTitleConversation,
  adminEditCategoryLabelConversation,
  adminEditResourceTypeLabelConversation,
  adminEditAnnouncementTitleConversation,
  adminEditAnnouncementContentConversation
} = require('../src/bot/conversations/adminManagementConversations');
const { config } = require('../src/config');
const userService = require('../src/services/userService');

describe('Full Edit & Permanent Delete Across Bot & Services', () => {
  let pool;

  before(async () => {
    pool = await setupTestDb();
    await seedTestDb(pool);
  });

  describe('Keyboards for Edit and Delete Capabilities', () => {
    it('Admin panel keyboard should contain Manage Uploaded Files option', () => {
      const kb = getAdminPanelKeyboard();
      const buttons = kb.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'admin_manage_resources')).to.be.true;
      expect(buttons.some(b => b.text.includes('Manage Uploaded Files'))).to.be.true;
    });

    it('Course details keyboard should contain edit name, edit code, delete, toggle, and back buttons', () => {
      const course = { id: 99, code: 'MATH 999', level: 200, is_active: true };
      const kb = getCourseDetailsKeyboard(course);
      const buttons = kb.inline_keyboard.flat();

      expect(buttons.some(b => b.callback_data === 'admin_crs_edit_title_99')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'admin_crs_edit_code_99')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'admin_crs_del_99')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'admin_crs_toggle_99')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'admin_crs_lvl_200')).to.be.true;
    });

    it('Resource details keyboard should contain edit title and delete completely buttons', () => {
      const resAcad = { id: 77, category: 'curriculum', course_id: 10 };
      const kbAcad = getResourceDetailsKeyboard(resAcad);
      const buttonsAcad = kbAcad.inline_keyboard.flat();

      expect(buttonsAcad.some(b => b.callback_data === 'admin_res_edit_title_77')).to.be.true;
      expect(buttonsAcad.some(b => b.callback_data === 'admin_res_del_77')).to.be.true;
      expect(buttonsAcad.some(b => b.callback_data === 'admin_res_crs_10')).to.be.true;

      const resByd = { id: 88, category: 'beyond_curriculum', beyond_category: 'python' };
      const kbByd = getResourceDetailsKeyboard(resByd);
      const buttonsByd = kbByd.inline_keyboard.flat();
      expect(buttonsByd.some(b => b.callback_data === 'admin_res_byd_python')).to.be.true;
    });

    it('Category details keyboard should contain edit label and delete completely buttons', () => {
      const cat = { key: 'deep_learning', label: '🤖 Deep Learning', is_active: true };
      const kb = getCategoryDetailsKeyboard(cat);
      const buttons = kb.inline_keyboard.flat();

      expect(buttons.some(b => b.callback_data === 'admin_cat_edit_deep_learning')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'admin_cat_del_deep_learning')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'admin_cat_toggle_deep_learning')).to.be.true;
    });

    it('Resource type details keyboard should contain edit label and delete completely buttons', () => {
      const type = { key: 'cheatsheet', label: '📄 Cheat Sheet', is_active: true };
      const kb = getResourceTypeDetailsKeyboard(type);
      const buttons = kb.inline_keyboard.flat();

      expect(buttons.some(b => b.callback_data === 'admin_type_edit_cheatsheet')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'admin_type_del_cheatsheet')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'admin_type_toggle_cheatsheet')).to.be.true;
    });

    it('Confirm delete keyboard should generate confirm and cancel buttons', () => {
      const kb = getConfirmDeleteKeyboard('confirm_action', 'cancel_action');
      const buttons = kb.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'confirm_action' && b.text.includes('Confirm'))).to.be.true;
      expect(buttons.some(b => b.callback_data === 'cancel_action' && b.text.includes('Cancel'))).to.be.true;
    });

    it('Announcement keyboards should generate manage, details, and confirm delete options', () => {
      const announcements = [{ id: 10, title: 'Exam Notice', priority: 'urgent' }];
      const manageKb = getManageAnnouncementsKeyboard(announcements);
      const manageBtns = manageKb.inline_keyboard.flat();
      expect(manageBtns.some(b => b.callback_data === 'admin_broadcast')).to.be.true;
      expect(manageBtns.some(b => b.callback_data === 'admin_ann_view_10')).to.be.true;

      const detailsKb = getAnnouncementDetailsKeyboard(announcements[0]);
      const detailsBtns = detailsKb.inline_keyboard.flat();
      expect(detailsBtns.some(b => b.callback_data === 'admin_ann_edit_title_10')).to.be.true;
      expect(detailsBtns.some(b => b.callback_data === 'admin_ann_edit_content_10')).to.be.true;
      expect(detailsBtns.some(b => b.callback_data === 'admin_ann_del_10')).to.be.true;

      const confirmKb = getConfirmDeleteAnnouncementKeyboard(10);
      const confirmBtns = confirmKb.inline_keyboard.flat();
      expect(confirmBtns.some(b => b.callback_data === 'admin_ann_del_confirm_10')).to.be.true;
    });
  });

  describe('Course Edit and Permanent Delete Operations', () => {
    let testCourse;

    beforeEach(async () => {
      testCourse = await courseService.createCourse({
        code: 'STAT 390',
        title: 'Time Series Forecasting Methods',
        level: 300,
        semester: 1,
        description: 'ARIMA, GARCH, and state space modeling'
      });
    });

    afterEach(async () => {
      if (testCourse && testCourse.id) {
        await courseService.deleteCourse(testCourse.id);
      }
    });

    it('should edit course name (title) permanently in PostgreSQL', async () => {
      const updated = await courseService.updateCourse(testCourse.id, {
        title: 'Advanced Time Series & Econometrics'
      });
      expect(updated.title).to.equal('Advanced Time Series & Econometrics');

      const reFetched = await courseService.getCourseById(testCourse.id);
      expect(reFetched.title).to.equal('Advanced Time Series & Econometrics');
    });

    it('should edit course code permanently in PostgreSQL', async () => {
      const updated = await courseService.updateCourse(testCourse.id, {
        code: 'STAT 395'
      });
      expect(updated.code).to.equal('STAT 395');

      const reFetched = await courseService.getCourseById(testCourse.id);
      expect(reFetched.code).to.equal('STAT 395');
    });

    it('should permanently delete course from PostgreSQL', async () => {
      const deleted = await courseService.deleteCourse(testCourse.id);
      expect(deleted.id).to.equal(testCourse.id);

      const check = await courseService.getCourseById(testCourse.id);
      expect(check).to.be.null;

      testCourse = null; // Prevent afterEach from re-deleting
    });

    it('handleAdminCoursesByLevel should route tapping to admin_crs_view_ instead of direct toggle', async () => {
      let sentText = '';
      let sentMarkup = null;
      const ctx = {
        callbackQuery: { data: 'admin_crs_lvl_300' },
        editMessageText: async (text, opts) => {
          sentText = text;
          sentMarkup = opts.reply_markup;
        }
      };

      await handleAdminCoursesByLevel(ctx, 300);
      expect(sentText).to.include('Level 300 Courses');
      const buttons = sentMarkup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === `admin_crs_view_${testCourse.id}`)).to.be.true;
      expect(buttons.some(b => b.callback_data === `admin_crs_toggle_${testCourse.id}`)).to.be.false;
    });

    it('handleViewCourse should render course details, resource count, and action buttons', async () => {
      let sentText = '';
      let sentMarkup = null;
      const ctx = {
        callbackQuery: { data: `admin_crs_view_${testCourse.id}`, answerCallbackQuery: async () => {} },
        editMessageText: async (text, opts) => {
          sentText = text;
          sentMarkup = opts.reply_markup;
        }
      };

      await handleViewCourse(ctx, testCourse.id);
      expect(sentText).to.include('Course Details: STAT 390');
      expect(sentText).to.include('Time Series Forecasting');
      expect(sentText).to.include('Uploaded Resources:');

      const buttons = sentMarkup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === `admin_crs_edit_title_${testCourse.id}`)).to.be.true;
      expect(buttons.some(b => b.callback_data === `admin_crs_edit_code_${testCourse.id}`)).to.be.true;
      expect(buttons.some(b => b.callback_data === `admin_crs_del_${testCourse.id}`)).to.be.true;
    });

    it('handleConfirmDeleteCourse should prompt confirmation with confirm and cancel buttons', async () => {
      let sentText = '';
      let sentMarkup = null;
      const ctx = {
        callbackQuery: { data: `admin_crs_del_${testCourse.id}`, answerCallbackQuery: async () => {} },
        editMessageText: async (text, opts) => {
          sentText = text;
          sentMarkup = opts.reply_markup;
        }
      };

      await handleConfirmDeleteCourse(ctx, testCourse.id);
      expect(sentText).to.include('Confirm Permanent Course Deletion');
      expect(sentText).to.include(testCourse.code);

      const buttons = sentMarkup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === `admin_crs_del_confirm_${testCourse.id}`)).to.be.true;
      expect(buttons.some(b => b.callback_data === `admin_crs_view_${testCourse.id}`)).to.be.true;
    });

    it('handleDeleteCourse should permanently remove the course and refresh level courses view', async () => {
      let answeredText = '';
      let refreshedText = '';
      const ctx = {
        callbackQuery: {
          data: `admin_crs_del_confirm_${testCourse.id}`,
          answerCallbackQuery: async (opts) => { answeredText = opts.text; }
        },
        editMessageText: async (text) => { refreshedText = text; }
      };

      await handleDeleteCourse(ctx, testCourse.id);
      expect(answeredText).to.include('deleted permanently');
      expect(refreshedText).to.include('Level 300 Courses');

      const check = await courseService.getCourseById(testCourse.id);
      expect(check).to.be.null;

      testCourse = null;
    });
  });

  describe('Resource Management & Permanent Deletion', () => {
    let testResource;

    beforeEach(async () => {
      testResource = await resourceService.createResource({
        title: 'Temporary Test Lab Script',
        description: 'R script for statistical simulation',
        resourceType: 'code_repo',
        category: 'beyond_curriculum',
        beyondCategory: 'r',
        fileUrl: 'https://example.com/test_script.R',
        fileFormat: 'code'
      });
    });

    afterEach(async () => {
      if (testResource && testResource.id) {
        await resourceService.deleteResource(testResource.id);
      }
    });

    it('should edit resource title via resourceService.updateResource', async () => {
      const updated = await resourceService.updateResource(testResource.id, {
        title: 'Renamed High-Performance R Simulation Script'
      });
      expect(updated.title).to.equal('Renamed High-Performance R Simulation Script');

      const reFetched = await resourceService.getResourceById(testResource.id);
      expect(reFetched.title).to.equal('Renamed High-Performance R Simulation Script');
    });

    it('should permanently delete resource from PostgreSQL', async () => {
      const deleted = await resourceService.deleteResource(testResource.id);
      expect(deleted.id).to.equal(testResource.id);

      const check = await resourceService.getResourceById(testResource.id);
      expect(check).to.be.null;

      testResource = null;
    });

    it('handleManageResources should render category options', async () => {
      let sentText = '';
      let sentMarkup = null;
      const ctx = {
        callbackQuery: { data: 'admin_manage_resources', answerCallbackQuery: async () => {} },
        editMessageText: async (text, opts) => {
          sentText = text;
          sentMarkup = opts.reply_markup;
        }
      };

      await handleManageResources(ctx);
      expect(sentText).to.include('Manage Uploaded Files');
      const buttons = sentMarkup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'admin_res_nav_acad')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'admin_res_nav_beyond')).to.be.true;
    });

    it('handleViewResource should display file details and edit/delete buttons', async () => {
      let sentText = '';
      let sentMarkup = null;
      const ctx = {
        callbackQuery: { data: `admin_res_view_${testResource.id}`, answerCallbackQuery: async () => {} },
        editMessageText: async (text, opts) => {
          sentText = text;
          sentMarkup = opts.reply_markup;
        }
      };

      await handleViewResource(ctx, testResource.id);
      expect(sentText).to.include('Resource File Details');
      expect(sentText).to.include(testResource.title);
      expect(sentText).to.match(/Accesses:|Downloads:/);
      expect(sentText).to.include('URL / Link:');

      const buttons = sentMarkup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === `admin_res_edit_title_${testResource.id}`)).to.be.true;
      expect(buttons.some(b => b.callback_data === `admin_res_del_${testResource.id}`)).to.be.true;
    });

    it('handleConfirmDeleteResource should display delete confirmation', async () => {
      let sentText = '';
      let sentMarkup = null;
      const ctx = {
        callbackQuery: { data: `admin_res_del_${testResource.id}`, answerCallbackQuery: async () => {} },
        editMessageText: async (text, opts) => {
          sentText = text;
          sentMarkup = opts.reply_markup;
        }
      };

      await handleConfirmDeleteResource(ctx, testResource.id);
      expect(sentText).to.include('Confirm Permanent File Deletion');
      expect(sentText).to.include(testResource.title);

      const buttons = sentMarkup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === `admin_res_del_confirm_${testResource.id}`)).to.be.true;
      expect(buttons.some(b => b.callback_data === `admin_res_view_${testResource.id}`)).to.be.true;
    });

    it('handleDeleteResource should permanently delete the resource file and refresh list', async () => {
      let answeredText = '';
      let refreshedText = '';
      const ctx = {
        callbackQuery: {
          data: `admin_res_del_confirm_${testResource.id}`,
          answerCallbackQuery: async (opts) => { answeredText = opts.text; }
        },
        editMessageText: async (text) => { refreshedText = text; }
      };

      await handleDeleteResource(ctx, testResource.id);
      expect(answeredText).to.include('deleted permanently');
      expect(refreshedText).to.include('Uploaded Files for');

      const check = await resourceService.getResourceById(testResource.id);
      expect(check).to.be.null;

      testResource = null;
    });
  });

  describe('Beyond Category Edit & Permanent Delete', () => {
    let testCategory;

    beforeEach(async () => {
      testCategory = await categoryService.createBeyondCategory({
        key: 'genomics_knust',
        label: '🧬 Computational Genomics',
        description: 'Bioinformatics and genomic sequencing analysis'
      });
    });

    afterEach(async () => {
      if (testCategory && testCategory.key) {
        await categoryService.deleteBeyondCategory(testCategory.key);
      }
    });

    it('should edit category label via categoryService.updateBeyondCategory', async () => {
      const updated = await categoryService.updateBeyondCategory(testCategory.key, {
        label: '🧬 Advanced Statistical Genomics'
      });
      expect(updated.label).to.equal('🧬 Advanced Statistical Genomics');

      const reFetched = await categoryService.getBeyondCategoryByKey(testCategory.key);
      expect(reFetched.label).to.equal('🧬 Advanced Statistical Genomics');
    });

    it('should permanently delete category via categoryService.deleteBeyondCategory', async () => {
      const deleted = await categoryService.deleteBeyondCategory(testCategory.key);
      expect(deleted.key).to.equal(testCategory.key);

      const check = await categoryService.getBeyondCategoryByKey(testCategory.key);
      expect(check).to.be.null;

      testCategory = null;
    });

    it('handleViewCategory should render edit and delete action buttons', async () => {
      let sentText = '';
      let sentMarkup = null;
      const ctx = {
        callbackQuery: { data: `admin_cat_view_${testCategory.key}`, answerCallbackQuery: async () => {} },
        editMessageText: async (text, opts) => {
          sentText = text;
          sentMarkup = opts.reply_markup;
        }
      };

      await handleViewCategory(ctx, testCategory.key);
      expect(sentText).to.include('Category Details');
      expect(sentText).to.include(testCategory.label);

      const buttons = sentMarkup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === `admin_cat_edit_${testCategory.key}`)).to.be.true;
      expect(buttons.some(b => b.callback_data === `admin_cat_del_${testCategory.key}`)).to.be.true;
    });

    it('handleConfirmDeleteCategory should show confirmation prompt', async () => {
      let sentText = '';
      let sentMarkup = null;
      const ctx = {
        callbackQuery: { data: `admin_cat_del_${testCategory.key}`, answerCallbackQuery: async () => {} },
        editMessageText: async (text, opts) => {
          sentText = text;
          sentMarkup = opts.reply_markup;
        }
      };

      await handleConfirmDeleteCategory(ctx, testCategory.key);
      expect(sentText).to.include('Confirm Permanent Category Deletion');

      const buttons = sentMarkup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === `admin_cat_del_confirm_${testCategory.key}`)).to.be.true;
      expect(buttons.some(b => b.callback_data === `admin_cat_view_${testCategory.key}`)).to.be.true;
    });

    it('handleDeleteCategory should permanently remove category and refresh categories list', async () => {
      let answeredText = '';
      let refreshedText = '';
      const ctx = {
        callbackQuery: {
          data: `admin_cat_del_confirm_${testCategory.key}`,
          answerCallbackQuery: async (opts) => { answeredText = opts.text; }
        },
        editMessageText: async (text) => { refreshedText = text; }
      };

      await handleDeleteCategory(ctx, testCategory.key);
      expect(answeredText).to.include('deleted permanently');
      expect(refreshedText).to.include('Manage Beyond Curriculum Categories');

      const check = await categoryService.getBeyondCategoryByKey(testCategory.key);
      expect(check).to.be.null;

      testCategory = null;
    });
  });

  describe('Resource Type Edit & Permanent Delete', () => {
    let testType;

    beforeEach(async () => {
      testType = await resourceTypeService.createResourceType({
        key: 'lab_manual',
        label: '🔬 Laboratory Manual',
        icon: '🔬',
        orderIndex: 12
      });
    });

    afterEach(async () => {
      if (testType && testType.key) {
        await resourceTypeService.deleteResourceType(testType.key);
      }
    });

    it('should edit resource type label via resourceTypeService.updateResourceType', async () => {
      const updated = await resourceTypeService.updateResourceType(testType.key, {
        label: '🔬 Practicum & Lab Guide'
      });
      expect(updated.label).to.equal('🔬 Practicum & Lab Guide');

      const reFetched = await resourceTypeService.getResourceTypeByKey(testType.key);
      expect(reFetched.label).to.equal('🔬 Practicum & Lab Guide');
    });

    it('should permanently delete resource type via resourceTypeService.deleteResourceType', async () => {
      const deleted = await resourceTypeService.deleteResourceType(testType.key);
      expect(deleted.key).to.equal(testType.key);

      const check = await resourceTypeService.getResourceTypeByKey(testType.key);
      expect(check).to.be.null;

      testType = null;
    });

    it('handleViewResourceType should render edit and delete action buttons', async () => {
      let sentText = '';
      let sentMarkup = null;
      const ctx = {
        callbackQuery: { data: `admin_type_view_${testType.key}`, answerCallbackQuery: async () => {} },
        editMessageText: async (text, opts) => {
          sentText = text;
          sentMarkup = opts.reply_markup;
        }
      };

      await handleViewResourceType(ctx, testType.key);
      expect(sentText).to.include('Resource Type Details');
      expect(sentText).to.include(testType.label);

      const buttons = sentMarkup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === `admin_type_edit_${testType.key}`)).to.be.true;
      expect(buttons.some(b => b.callback_data === `admin_type_del_${testType.key}`)).to.be.true;
    });

    it('handleConfirmDeleteResourceType should display confirmation prompt', async () => {
      let sentText = '';
      let sentMarkup = null;
      const ctx = {
        callbackQuery: { data: `admin_type_del_${testType.key}`, answerCallbackQuery: async () => {} },
        editMessageText: async (text, opts) => {
          sentText = text;
          sentMarkup = opts.reply_markup;
        }
      };

      await handleConfirmDeleteResourceType(ctx, testType.key);
      expect(sentText).to.include('Confirm Permanent Resource Type Deletion');

      const buttons = sentMarkup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === `admin_type_del_confirm_${testType.key}`)).to.be.true;
      expect(buttons.some(b => b.callback_data === `admin_type_view_${testType.key}`)).to.be.true;
    });

    it('handleDeleteResourceType should permanently remove resource type and refresh types list', async () => {
      let answeredText = '';
      let refreshedText = '';
      const ctx = {
        callbackQuery: {
          data: `admin_type_del_confirm_${testType.key}`,
          answerCallbackQuery: async (opts) => { answeredText = opts.text; }
        },
        editMessageText: async (text) => { refreshedText = text; }
      };

      await handleDeleteResourceType(ctx, testType.key);
      expect(answeredText).to.include('deleted permanently');
      expect(refreshedText).to.include('Manage Resource Types');

      const check = await resourceTypeService.getResourceTypeByKey(testType.key);
      expect(check).to.be.null;

      testType = null;
    });
  });

  describe('Foreign Key Integrity on Course Permanent Deletion', () => {
    it('should cascade delete topics and set NULL on resource course_id when course is deleted', async () => {
      const parentCourse = await courseService.createCourse({
        code: 'TEST 499',
        title: 'Cascade and Nullification Verification',
        level: 400,
        semester: 2,
        description: 'Verifying relational integrity'
      });

      // Add a topic
      const topicRes = await pool.query(
        `INSERT INTO topics (course_id, title, description, order_index)
         VALUES ($1, 'Topic to be Cascaded', 'Cascaded test', 1)
         RETURNING id;`,
        [parentCourse.id]
      );
      const topicId = topicRes.rows[0].id;

      // Add a resource linked to this course
      const resource = await resourceService.createResource({
        title: 'Resource Attached to Deleted Course',
        description: 'Should remain with course_id set to null',
        resourceType: 'past_question',
        category: 'curriculum',
        courseId: parentCourse.id,
        fileUrl: 'https://example.com/test_resource.pdf'
      });

      expect(resource.course_id).to.equal(parentCourse.id);

      // Permanently delete course
      await courseService.deleteCourse(parentCourse.id);

      // Course is gone
      const courseCheck = await courseService.getCourseById(parentCourse.id);
      expect(courseCheck).to.be.null;

      // Topic is cascade deleted
      const topicsCheck = await courseService.getTopicsByCourseId(parentCourse.id);
      expect(topicsCheck).to.be.empty;

      // Resource remains in database with course_id set to NULL
      const resCheck = await resourceService.getResourceById(resource.id);
      expect(resCheck).to.exist;
      expect(resCheck.course_id).to.be.null;

      // Resource details keyboard and view shouldn't crash when course_id is null
      const kb = getResourceDetailsKeyboard(resCheck);
      const buttons = kb.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'admin_manage_resources')).to.be.true;

      // Clean up resource
      await resourceService.deleteResource(resource.id);
    });
  });

  describe('Admin Authorization Guards on Handlers', () => {
    let studentUser;

    before(async () => {
      studentUser = await userService.findOrCreateUser({
        telegramId: 777666555,
        username: 'regular_student',
        firstName: 'Akosua',
        lastName: 'Mensah',
        role: 'student'
      });
    });

    it('should deny unauthorized user from deleting course', async () => {
      let toastText = '';
      const ctx = {
        from: { id: studentUser.telegram_id },
        callbackQuery: {
          data: 'admin_crs_del_confirm_1',
          answerCallbackQuery: async (opts) => { toastText = opts.text; }
        }
      };

      await handleDeleteCourse(ctx, 1);
      expect(toastText).to.include('Access denied');
    });

    it('should deny unauthorized user from deleting resource file', async () => {
      let toastText = '';
      const ctx = {
        from: { id: studentUser.telegram_id },
        callbackQuery: {
          data: 'admin_res_del_confirm_1',
          answerCallbackQuery: async (opts) => { toastText = opts.text; }
        }
      };

      await handleDeleteResource(ctx, 1);
      expect(toastText).to.include('Access denied');
    });

    it('should deny unauthorized user from deleting category', async () => {
      let toastText = '';
      const ctx = {
        from: { id: studentUser.telegram_id },
        callbackQuery: {
          data: 'admin_cat_del_confirm_r',
          answerCallbackQuery: async (opts) => { toastText = opts.text; }
        }
      };

      await handleDeleteCategory(ctx, 'r');
      expect(toastText).to.include('Access denied');
    });

    it('should deny unauthorized user from deleting resource type', async () => {
      let toastText = '';
      const ctx = {
        from: { id: studentUser.telegram_id },
        callbackQuery: {
          data: 'admin_type_del_confirm_past_question',
          answerCallbackQuery: async (opts) => { toastText = opts.text; }
        }
      };

      await handleDeleteResourceType(ctx, 'past_question');
      expect(toastText).to.include('Access denied');
    });
  });

  describe('Admin Edit Conversations Simulation', () => {
    let adminTelegramId;
    let editableCourse;

    before(async () => {
      adminTelegramId = 999111222;
      config.adminTelegramIds = [adminTelegramId];
      await userService.findOrCreateUser({
        telegramId: adminTelegramId,
        username: 'admin_user',
        firstName: 'Chief',
        role: 'admin'
      });

      editableCourse = await courseService.createCourse({
        code: 'STAT 350',
        title: 'Original Course Title',
        level: 300,
        semester: 1,
        description: 'Original description'
      });
    });

    after(async () => {
      if (editableCourse && editableCourse.id) {
        await courseService.deleteCourse(editableCourse.id);
      }
    });

    function createMockConversation(inputs) {
      let idx = 0;
      return {
        session: {},
        external: async (fn) => await fn(),
        waitFor: async () => {
          const val = inputs[idx++];
          return val;
        }
      };
    }

    it('adminEditCourseTitleConversation should update course title and clean up session', async () => {
      const conversation = createMockConversation([
        { message: { text: 'New Interactive Statistical Computing' } }
      ]);
      const replies = [];
      const ctx = {
        from: { id: adminTelegramId },
        session: { editCourseId: editableCourse.id },
        reply: async (text) => { replies.push(text); }
      };

      await adminEditCourseTitleConversation(conversation, ctx);
      expect(replies.some(r => r.includes('Course Name Updated Successfully'))).to.be.true;

      const updated = await courseService.getCourseById(editableCourse.id);
      expect(updated.title).to.equal('New Interactive Statistical Computing');
      expect(ctx.session.editCourseId).to.be.undefined;
    });

    it('adminEditCourseTitleConversation should abort when cancelled via /cancel', async () => {
      const conversation = createMockConversation([
        { message: { text: '/cancel' } }
      ]);
      const replies = [];
      const ctx = {
        from: { id: adminTelegramId },
        session: { editCourseId: editableCourse.id },
        reply: async (text) => { replies.push(text); }
      };

      await adminEditCourseTitleConversation(conversation, ctx);
      expect(replies.some(r => r.includes('Edit cancelled'))).to.be.true;
    });

    it('adminEditCourseCodeConversation should update course code', async () => {
      const conversation = createMockConversation([
        { message: { text: 'STAT 355' } }
      ]);
      const replies = [];
      const ctx = {
        from: { id: adminTelegramId },
        session: { editCourseId: editableCourse.id },
        reply: async (text) => { replies.push(text); }
      };

      await adminEditCourseCodeConversation(conversation, ctx);
      expect(replies.some(r => r.includes('Course Code Updated Successfully'))).to.be.true;

      const updated = await courseService.getCourseById(editableCourse.id);
      expect(updated.code).to.equal('STAT 355');
    });

    it('adminEditResourceTitleConversation should update resource file title', async () => {
      const testFile = await resourceService.createResource({
        title: 'Original File Name',
        description: 'Sample file',
        resourceType: 'syllabus',
        category: 'curriculum',
        fileUrl: 'https://example.com/syllabus.pdf'
      });

      const conversation = createMockConversation([
        { message: { text: 'Updated Official Syllabus 2026' } }
      ]);
      const replies = [];
      const ctx = {
        from: { id: adminTelegramId },
        session: { editResourceId: testFile.id },
        reply: async (text) => { replies.push(text); }
      };

      await adminEditResourceTitleConversation(conversation, ctx);
      expect(replies.some(r => r.includes('File Renamed Successfully'))).to.be.true;

      const updated = await resourceService.getResourceById(testFile.id);
      expect(updated.title).to.equal('Updated Official Syllabus 2026');

      await resourceService.deleteResource(testFile.id);
    });

    it('adminEditCategoryLabelConversation should update category label with emoji parsing', async () => {
      const testCat = await categoryService.createBeyondCategory({
        key: 'powerbi_dash',
        label: '📈 Power BI Essentials',
        description: 'Dashboards and analytics'
      });

      const conversation = createMockConversation([
        { message: { text: '📊 Power BI & Advanced DAX' } }
      ]);
      const replies = [];
      const ctx = {
        from: { id: adminTelegramId },
        session: { editCategoryKey: testCat.key },
        reply: async (text) => { replies.push(text); }
      };

      await adminEditCategoryLabelConversation(conversation, ctx);
      expect(replies.some(r => r.includes('Category Label Updated Successfully'))).to.be.true;

      const updated = await categoryService.getBeyondCategoryByKey(testCat.key);
      expect(updated.label).to.equal('📊 Power BI & Advanced DAX');
      expect(updated.icon).to.equal('📊');

      await categoryService.deleteBeyondCategory(testCat.key);
    });

    it('adminEditResourceTypeLabelConversation should update resource type label', async () => {
      const testType = await resourceTypeService.createResourceType({
        key: 'quick_quiz',
        label: '❓ Weekly Quiz',
        icon: '❓',
        orderIndex: 20
      });

      const conversation = createMockConversation([
        { message: { text: '🎯 Weekly Quizzes & Drills' } }
      ]);
      const replies = [];
      const ctx = {
        from: { id: adminTelegramId },
        session: { editResourceTypeKey: testType.key },
        reply: async (text) => { replies.push(text); }
      };

      await adminEditResourceTypeLabelConversation(conversation, ctx);
      expect(replies.some(r => r.includes('Resource Type Updated Successfully'))).to.be.true;

      const updated = await resourceTypeService.getResourceTypeByKey(testType.key);
      expect(updated.label).to.equal('🎯 Weekly Quizzes & Drills');
      expect(updated.icon).to.equal('🎯');

      await resourceTypeService.deleteResourceType(testType.key);
    });

    it('adminEditAnnouncementTitleConversation should update announcement title', async () => {
      const ann = await announcementService.createAnnouncement({
        title: 'Draft Announcement Title',
        content: 'This announcement will be renamed.',
        priority: 'normal'
      });

      const conversation = createMockConversation([
        { message: { text: 'Finalized Announcement Title' } }
      ]);
      const replies = [];
      const ctx = {
        from: { id: adminTelegramId },
        session: { editAnnouncementId: ann.id },
        reply: async (text) => { replies.push(text); }
      };

      await adminEditAnnouncementTitleConversation(conversation, ctx);
      expect(replies.some(r => r.includes('Announcement Title Updated Successfully'))).to.be.true;

      const updated = await announcementService.getAnnouncementById(ann.id);
      expect(updated.title).to.equal('Finalized Announcement Title');

      await announcementService.deleteAnnouncement(ann.id);
    });

    it('adminEditAnnouncementContentConversation should update announcement content', async () => {
      const ann = await announcementService.createAnnouncement({
        title: 'Seminar Schedule',
        content: 'Draft content for seminar.',
        priority: 'normal'
      });

      const conversation = createMockConversation([
        { message: { text: 'Full seminar starts at 10:00 AM in the Math Auditorium.' } }
      ]);
      const replies = [];
      const ctx = {
        from: { id: adminTelegramId },
        session: { editAnnouncementId: ann.id },
        reply: async (text) => { replies.push(text); }
      };

      await adminEditAnnouncementContentConversation(conversation, ctx);
      expect(replies.some(r => r.includes('Announcement Content Updated Successfully'))).to.be.true;

      const updated = await announcementService.getAnnouncementById(ann.id);
      expect(updated.content).to.equal('Full seminar starts at 10:00 AM in the Math Auditorium.');

      await announcementService.deleteAnnouncement(ann.id);
    });
  });

  describe('Announcement Admin Handlers', () => {
    const adminId = 999111222;

    it('handleManageAnnouncements and handleViewAnnouncement should render details', async () => {
      const ann = await announcementService.createAnnouncement({
        title: 'Tech Talk Announcement',
        content: 'Special session on R packages.',
        priority: 'event',
        targetLevel: 300
      });

      const ctxList = {
        from: { id: adminId },
        reply: async (text, opts) => {
          expect(text).to.include('Announcements & Broadcasts');
          expect(opts.reply_markup).to.exist;
        }
      };
      await handleManageAnnouncements(ctxList);

      const ctxView = {
        from: { id: adminId },
        reply: async (text, opts) => {
          expect(text).to.include('Announcement Details');
          expect(text).to.include('Tech Talk Announcement');
          expect(opts.reply_markup).to.exist;
        }
      };
      await handleViewAnnouncement(ctxView, ann.id);

      const ctxDelConfirm = {
        from: { id: adminId },
        reply: async (text, opts) => {
          expect(text).to.include('Delete Announcement Confirmation');
          expect(opts.reply_markup).to.exist;
        }
      };
      await handleConfirmDeleteAnnouncement(ctxDelConfirm, ann.id);

      const ctxDelete = {
        from: { id: adminId },
        answerCallbackQuery: async () => {},
        reply: async () => {}
      };
      await handleDeleteAnnouncement(ctxDelete, ann.id);

      const deleted = await announcementService.getAnnouncementById(ann.id);
      expect(deleted).to.be.null;
    });
  });
});
