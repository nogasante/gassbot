const { Bot, session } = require('grammy');
const { conversations, createConversation } = require('@grammyjs/conversations');
const { config } = require('../config');

const { handleStart } = require('./handlers/start');
const {
  handleAcademicMenu,
  handleLevelSelect,
  handleSemesterSelect,
  handleCourseSelect,
  handleResourceList,
  handleQuickCourseRequest
} = require('./handlers/academic');
const {
  handleBeyondMenu,
  handleBeyondPillarSelect,
  handleBeyondSubTopicSelect,
  handleBeyondResourceView,
  handleBeyondCategorySelect
} = require('./handlers/beyond');
const { handleSearchCommand, handleSearchMenuPrompt, executeSearch } = require('./handlers/search');
const { handleNotificationsMenu, handleNotificationToggle, handleAcademicLevelPreference } = require('./handlers/notifications');
const { handleAppInfo } = require('./handlers/app');
const { handleHelp } = require('./handlers/help');
const {
  handleAdminMenu,
  handleListPendingRequests,
  handleViewRequest,
  handleModerateRequest,
  handleAdminStats,
  handleManageCourses,
  handleAdminCoursesByLevel,
  handleViewCourse,
  handleConfirmDeleteCourse,
  handleDeleteCourse,
  handleToggleCourseActive,
  handleManageCategories,
  handleViewCategory,
  handleConfirmDeleteCategory,
  handleDeleteCategory,
  handleToggleCategoryActive,
  handleManageResourceTypes,
  handleViewResourceType,
  handleConfirmDeleteResourceType,
  handleDeleteResourceType,
  handleToggleResourceTypeActive,
  handleManageResources,
  handleManageResourcesAcadLevels,
  handleManageResourcesCourses,
  handleManageResourcesListByCourse,
  handleManageResourcesBeyondCategories,
  handleManageResourcesListByBeyond,
  handleViewResource,
  handleConfirmDeleteResource,
  handleDeleteResource,
  handleManageAnnouncements,
  handleViewAnnouncement,
  handleConfirmDeleteAnnouncement,
  handleDeleteAnnouncement,
  handleManageAdmins,
  handleViewAdmin,
  handleConfirmDemoteAdmin,
  handleDemoteAdmin,
  handleAddAdminCommand
} = require('./handlers/admin');
const {
  handleRequestMenu,
  handleRequestLevelMenu,
  handleRequestSemesterMenu,
  handleRequestCourseList,
  handleRequestCoursePick,
  handleRequestBeyondMenu,
  handleRequestBeyondPick
} = require('./handlers/request');

const { requestResourceConversation } = require('./conversations/requestConversation');
const { broadcastConversation } = require('./conversations/broadcastConversation');
const { addResourceConversation } = require('./conversations/addResourceConversation');
const {
  adminAddCourseConversation,
  adminAddCategoryConversation,
  adminAddResourceTypeConversation,
  adminAddTopicConversation,
  adminEditCourseTitleConversation,
  adminEditCourseCodeConversation,
  adminEditResourceTitleConversation,
  adminEditCategoryLabelConversation,
  adminEditResourceTypeLabelConversation,
  adminEditAnnouncementTitleConversation,
  adminEditAnnouncementContentConversation,
  adminAddAdminConversation
} = require('./conversations/adminManagementConversations');
const { handleSendResourceFile } = require('./handlers/academic');
const { getMainMenuKeyboard } = require('./keyboards/mainMenu');
const { isUserAdmin } = require('./handlers/admin');
const { getUserByTelegramId } = require('../services/userService');

function createBot(token = config.botToken) {
  const bot = new Bot(token || 'dummy_token_for_init');

  // Middleware: Sessions & Conversations
  bot.use(session({ initial: () => ({}) }));
  bot.use(conversations());
  bot.use(createConversation(requestResourceConversation));
  bot.use(createConversation(broadcastConversation));
  bot.use(createConversation(addResourceConversation));
  bot.use(createConversation(adminAddCourseConversation));
  bot.use(createConversation(adminAddCategoryConversation));
  bot.use(createConversation(adminAddResourceTypeConversation));
  bot.use(createConversation(adminAddTopicConversation));
  bot.use(createConversation(adminEditCourseTitleConversation));
  bot.use(createConversation(adminEditCourseCodeConversation));
  bot.use(createConversation(adminEditResourceTitleConversation));
  bot.use(createConversation(adminEditCategoryLabelConversation));
  bot.use(createConversation(adminEditResourceTypeLabelConversation));
  bot.use(createConversation(adminEditAnnouncementTitleConversation));
  bot.use(createConversation(adminEditAnnouncementContentConversation));
  bot.use(createConversation(adminAddAdminConversation));

  // Global Error Handler
  bot.catch((err) => {
    const desc = err.error?.description || err.error?.message || '';
    if (desc.includes('query is too old') || desc.includes('message is not modified')) {
      return;
    }
    console.error('Bot Error encountered in update:', err.ctx?.update?.update_id, err.error);
  });

  // Base Commands
  bot.command('start', handleStart);
  bot.command('menu', handleStart);
  bot.command('courses', handleAcademicMenu);
  bot.command('beyond', handleBeyondMenu);
  bot.command('search', handleSearchCommand);
  bot.command('request', handleRequestMenu);
  bot.command('notifications', handleNotificationsMenu);
  bot.command('app', handleAppInfo);
  bot.command('help', handleHelp);
  bot.command('about', handleHelp);
  bot.command('admin', handleAdminMenu);
  bot.command('admins', handleManageAdmins);
  bot.command('addadmin', handleAddAdminCommand);

  // Persistent 3-Column Reply Keyboard Listeners
  bot.hears(['📚 Academic', '📚 Academic Resources'], handleAcademicMenu);
  bot.hears(['🚀 Beyond', '🚀 Beyond Curriculum'], handleBeyondMenu);
  bot.hears(['🔍 Find Resource', '🔍 Search'], handleSearchMenuPrompt);
  bot.hears(['📝 Request File', '📝 Request Resource'], handleRequestMenu);
  bot.hears(['🔔 Alerts', '🔔 Notifications'], handleNotificationsMenu);
  bot.hears(['📲 Gassa App', '📲 Get App', '🌐 Web App'], handleAppInfo);
  bot.hears(['⚡ Admin Panel', '⚡ Admin'], handleAdminMenu);
  bot.hears('➕ Upload File', async (ctx) => {
    await ctx.conversation.enter('addResourceConversation');
  });
  bot.hears(['ℹ️ About GASS', 'ℹ️ About', '💬 Help'], handleHelp);

  // Callback Query Handlers
  bot.callbackQuery('menu_main', async (ctx) => {
    await ctx.answerCallbackQuery();
    const dbUser = await getUserByTelegramId(ctx.from.id);
    const isAdmin = isUserAdmin(ctx.from.id, dbUser);
    const { getBrandConfig } = require('../services/settingsService');
    const brand = await getBrandConfig();
    await ctx.editMessageText(
      `🇬🇭 *${brand.name} Main Navigation*\n━━━━━━━━━━━━━━━━━━\n_"${brand.slogan}"_\n\nPlease select an option below:`,
      {
        parse_mode: 'Markdown',
        reply_markup: getMainMenuKeyboard(isAdmin, brand.links?.playStore)
      }
    );
  });

  bot.callbackQuery('menu_academic', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleAcademicMenu(ctx);
  });

  bot.callbackQuery('menu_beyond', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleBeyondMenu(ctx);
  });

  bot.callbackQuery('menu_search', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleSearchMenuPrompt(ctx);
  });

  bot.callbackQuery('menu_request', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleRequestMenu(ctx);
  });

  bot.callbackQuery('menu_notifications', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleNotificationsMenu(ctx);
  });

  bot.callbackQuery('menu_app', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleAppInfo(ctx);
  });

  bot.callbackQuery('menu_help', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleHelp(ctx);
  });

  bot.callbackQuery('menu_admin', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleAdminMenu(ctx);
  });

  // Academic Sub-navigation
  bot.callbackQuery(/^acad_lvl_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const level = parseInt(ctx.match[1], 10);
    await handleLevelSelect(ctx, level);
  });

  bot.callbackQuery(/^acad_sem_(\d+)_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const level = parseInt(ctx.match[1], 10);
    const semester = parseInt(ctx.match[2], 10);
    await handleSemesterSelect(ctx, level, semester);
  });

  bot.callbackQuery(/^acad_crs_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const courseId = parseInt(ctx.match[1], 10);
    await handleCourseSelect(ctx, courseId);
  });

  bot.callbackQuery(/^res_list_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const courseId = parseInt(ctx.match[1], 10);
    await handleResourceList(ctx, courseId);
  });

  bot.callbackQuery(/^res_type_(\d+)_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const courseId = parseInt(ctx.match[1], 10);
    const resourceType = ctx.match[2];
    await handleResourceList(ctx, courseId, resourceType);
  });

  bot.callbackQuery(/^req_course_(\d+)$/, async (ctx) => {
    const courseId = parseInt(ctx.match[1], 10);
    await handleQuickCourseRequest(ctx, courseId);
  });

  bot.callbackQuery(/^req_raw_(.+)$/, async (ctx) => {
    const rawEncoded = ctx.match[1];
    let queryText = 'General Material';
    try {
      queryText = Buffer.from(rawEncoded, 'base64url').toString('utf8');
    } catch (e) {}

    const { findOrCreateUser } = require('../services/userService');
    const { createRequest } = require('../services/requestService');
    const { escapeMarkdown } = require('./utils/format');

    const dbUser = await findOrCreateUser({
      telegramId: ctx.from.id,
      username: ctx.from.username || null,
      firstName: ctx.from.first_name || '',
      lastName: ctx.from.last_name || ''
    });

    const created = await createRequest({
      userId: dbUser.id,
      courseCode: queryText.slice(0, 30).toUpperCase(),
      topicTitle: queryText,
      details: `Request for "${queryText}"`
    });

    await ctx.answerCallbackQuery({ text: 'Request submitted.' });

    const text = 
`✅ *Request Submitted*
━━━━━━━━━━━━━━━━━━
Material: *${escapeMarkdown(queryText)}*
Request ID: #${created.id}

Your request has been received. You will be sent the file once an executive uploads it.`;

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard()
        .text('🔍 Search Another Topic', 'menu_search')
        .text('🏠 Main Menu', 'menu_main')
    });
  });

  // Button-Driven Request Navigation
  bot.callbackQuery('req_nav_acad', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleRequestLevelMenu(ctx);
  });

  bot.callbackQuery(/^req_lvl_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const level = parseInt(ctx.match[1], 10);
    await handleRequestSemesterMenu(ctx, level);
  });

  bot.callbackQuery(/^req_sem_(\d+)_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const level = parseInt(ctx.match[1], 10);
    const semester = parseInt(ctx.match[2], 10);
    await handleRequestCourseList(ctx, level, semester);
  });

  bot.callbackQuery(/^req_crs_pick_(\d+)$/, async (ctx) => {
    const courseId = parseInt(ctx.match[1], 10);
    await handleRequestCoursePick(ctx, courseId);
  });

  bot.callbackQuery('req_nav_beyond', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleRequestBeyondMenu(ctx);
  });

  bot.callbackQuery(/^req_byd_pick_(.+)$/, async (ctx) => {
    const categoryKey = ctx.match[1];
    await handleRequestBeyondPick(ctx, categoryKey);
  });

  bot.callbackQuery('req_custom_text', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter('requestResourceConversation');
  });

  // Beyond Curriculum Flow (Pillars -> Subtopics -> Resources -> Cards)
  bot.callbackQuery(/^beyond_pillar_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const pillarKey = ctx.match[1];
    await handleBeyondPillarSelect(ctx, pillarKey);
  });

  bot.callbackQuery(/^beyond_sub_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const subTopicKey = ctx.match[1];
    await handleBeyondSubTopicSelect(ctx, subTopicKey);
  });

  bot.callbackQuery(/^beyond_res_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const resourceId = parseInt(ctx.match[1], 10);
    await handleBeyondResourceView(ctx, resourceId);
  });

  bot.callbackQuery(/^beyond_cat_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const categoryKey = ctx.match[1];
    await handleBeyondCategorySelect(ctx, categoryKey);
  });

  bot.callbackQuery(/^res_bookmark_(\d+)$/, async (ctx) => {
    const resourceId = parseInt(ctx.match[1], 10);
    const { getOrCreateUser } = require('../services/userService');
    const { saveResourceBookmark } = require('../services/resourceService');
    const user = await getOrCreateUser(ctx.from);
    await saveResourceBookmark(user.id, resourceId);
    await ctx.answerCallbackQuery({ text: '⭐ Saved to your bookmarks!' });
  });

  // Notifications toggles
  bot.callbackQuery(/^notif_toggle_(on|off)$/, async (ctx) => {
    const enabled = ctx.match[1] === 'on';
    await handleNotificationToggle(ctx, enabled);
  });

  bot.callbackQuery('notif_set_all', async (ctx) => {
    await handleAcademicLevelPreference(ctx, null);
  });

  bot.callbackQuery(/^notif_set_(\d+)$/, async (ctx) => {
    const level = parseInt(ctx.match[1], 10);
    await handleAcademicLevelPreference(ctx, level);
  });

  // Admin Sub-actions
  bot.callbackQuery('admin_requests', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleListPendingRequests(ctx);
  });

  bot.callbackQuery(/^admin_req_view_(\d+)_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const requestId = parseInt(ctx.match[1], 10);
    const index = parseInt(ctx.match[2], 10);
    await handleViewRequest(ctx, requestId, index);
  });

  bot.callbackQuery(/^admin_req_approve_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter('addResourceConversation');
  });

  bot.callbackQuery(/^admin_req_reject_(\d+)$/, async (ctx) => {
    const requestId = parseInt(ctx.match[1], 10);
    await handleModerateRequest(ctx, requestId, 'reject');
  });

  // Admin Announcements Management
  bot.callbackQuery('admin_manage_announcements', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleManageAnnouncements(ctx);
  });

  bot.callbackQuery(/^admin_ann_view_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const id = parseInt(ctx.match[1], 10);
    await handleViewAnnouncement(ctx, id);
  });

  bot.callbackQuery(/^admin_ann_edit_title_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    ctx.session.editAnnouncementId = parseInt(ctx.match[1], 10);
    await ctx.conversation.enter('adminEditAnnouncementTitleConversation');
  });

  bot.callbackQuery(/^admin_ann_edit_content_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    ctx.session.editAnnouncementId = parseInt(ctx.match[1], 10);
    await ctx.conversation.enter('adminEditAnnouncementContentConversation');
  });

  bot.callbackQuery(/^admin_ann_del_confirm_(\d+)$/, async (ctx) => {
    const id = parseInt(ctx.match[1], 10);
    await handleDeleteAnnouncement(ctx, id);
  });

  bot.callbackQuery(/^admin_ann_del_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const id = parseInt(ctx.match[1], 10);
    await handleConfirmDeleteAnnouncement(ctx, id);
  });

  // Admin Management Flow
  bot.callbackQuery('admin_manage_admins', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleManageAdmins(ctx);
  });

  bot.callbackQuery('admin_add_admin', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter('adminAddAdminConversation');
  });

  bot.callbackQuery(/^admin_view_admin_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const tid = parseInt(ctx.match[1], 10);
    await handleViewAdmin(ctx, tid);
  });

  bot.callbackQuery(/^admin_demote_confirm_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const tid = parseInt(ctx.match[1], 10);
    await handleConfirmDemoteAdmin(ctx, tid);
  });

  bot.callbackQuery(/^admin_demote_do_(\d+)$/, async (ctx) => {
    const tid = parseInt(ctx.match[1], 10);
    await handleDemoteAdmin(ctx, tid);
  });

  bot.callbackQuery('admin_broadcast', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter('broadcastConversation');
  });

  bot.command('addresource', async (ctx) => {
    await ctx.conversation.enter('addResourceConversation');
  });

  bot.callbackQuery('admin_add_resource', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter('addResourceConversation');
  });

  bot.callbackQuery(/^res_send_(\d+)$/, async (ctx) => {
    const resourceId = parseInt(ctx.match[1], 10);
    await handleSendResourceFile(ctx, resourceId);
  });

  bot.callbackQuery('admin_stats', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleAdminStats(ctx);
  });

  // Admin Course Management
  bot.callbackQuery('admin_manage_courses', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleManageCourses(ctx);
  });

  bot.callbackQuery('admin_course_add', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter('adminAddCourseConversation');
  });

  bot.callbackQuery(/^admin_crs_lvl_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const level = parseInt(ctx.match[1], 10);
    await handleAdminCoursesByLevel(ctx, level);
  });

  bot.callbackQuery(/^admin_crs_view_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const courseId = parseInt(ctx.match[1], 10);
    await handleViewCourse(ctx, courseId);
  });

  bot.callbackQuery(/^admin_crs_edit_title_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    ctx.session.editCourseId = parseInt(ctx.match[1], 10);
    await ctx.conversation.enter('adminEditCourseTitleConversation');
  });

  bot.callbackQuery(/^admin_crs_edit_code_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    ctx.session.editCourseId = parseInt(ctx.match[1], 10);
    await ctx.conversation.enter('adminEditCourseCodeConversation');
  });

  bot.callbackQuery(/^admin_crs_del_confirm_(\d+)$/, async (ctx) => {
    const courseId = parseInt(ctx.match[1], 10);
    await handleDeleteCourse(ctx, courseId);
  });

  bot.callbackQuery(/^admin_crs_del_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const courseId = parseInt(ctx.match[1], 10);
    await handleConfirmDeleteCourse(ctx, courseId);
  });

  bot.callbackQuery(/^admin_crs_toggle_(\d+)$/, async (ctx) => {
    const courseId = parseInt(ctx.match[1], 10);
    await handleToggleCourseActive(ctx, courseId);
  });

  // Admin Resource Files Management
  bot.callbackQuery('admin_manage_resources', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleManageResources(ctx);
  });

  bot.callbackQuery('admin_res_nav_acad', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleManageResourcesAcadLevels(ctx);
  });

  bot.callbackQuery(/^admin_res_lvl_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const level = parseInt(ctx.match[1], 10);
    await handleManageResourcesCourses(ctx, level);
  });

  bot.callbackQuery(/^admin_res_crs_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const courseId = parseInt(ctx.match[1], 10);
    await handleManageResourcesListByCourse(ctx, courseId);
  });

  bot.callbackQuery('admin_res_nav_beyond', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleManageResourcesBeyondCategories(ctx);
  });

  bot.callbackQuery(/^admin_res_byd_(?:sub_)?(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const key = ctx.match[1];
    await handleManageResourcesListByBeyond(ctx, key);
  });

  bot.callbackQuery(/^admin_res_view_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const resourceId = parseInt(ctx.match[1], 10);
    await handleViewResource(ctx, resourceId);
  });

  bot.callbackQuery(/^admin_res_edit_title_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    ctx.session.editResourceId = parseInt(ctx.match[1], 10);
    await ctx.conversation.enter('adminEditResourceTitleConversation');
  });

  bot.callbackQuery(/^admin_res_del_confirm_(\d+)$/, async (ctx) => {
    const resourceId = parseInt(ctx.match[1], 10);
    await handleDeleteResource(ctx, resourceId);
  });

  bot.callbackQuery(/^admin_res_del_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const resourceId = parseInt(ctx.match[1], 10);
    await handleConfirmDeleteResource(ctx, resourceId);
  });

  // Unified Beyond Curriculum Management
  bot.callbackQuery('admin_manage_beyond_unified', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleManageResourcesBeyondCategories(ctx);
  });

  // In-context Add Material to Course
  bot.callbackQuery(/^admin_crs_add_res_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter('addResourceConversation');
  });

  // In-context Add Material to Topic
  bot.callbackQuery(/^admin_byd_add_res_([a-z0-9_-]+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter('addResourceConversation');
  });

  // In-context Add Topic under Category
  bot.callbackQuery(/^admin_byd_add_topic_([a-z0-9_-]+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter('adminAddTopicConversation');
  });

  // Admin Category Management
  bot.callbackQuery('admin_manage_categories', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleManageCategories(ctx);
  });

  bot.callbackQuery('admin_cat_add', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter('adminAddCategoryConversation');
  });

  bot.callbackQuery(/^admin_cat_view_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const key = ctx.match[1];
    await handleViewCategory(ctx, key);
  });

  bot.callbackQuery(/^admin_cat_edit_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    ctx.session.editCategoryKey = ctx.match[1];
    await ctx.conversation.enter('adminEditCategoryLabelConversation');
  });

  bot.callbackQuery(/^admin_cat_del_confirm_(.+)$/, async (ctx) => {
    const key = ctx.match[1];
    await handleDeleteCategory(ctx, key);
  });

  bot.callbackQuery(/^admin_cat_del_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const key = ctx.match[1];
    await handleConfirmDeleteCategory(ctx, key);
  });

  bot.callbackQuery(/^admin_cat_toggle_(.+)$/, async (ctx) => {
    const key = ctx.match[1];
    await handleToggleCategoryActive(ctx, key);
  });

  // Admin Resource Type Management
  bot.callbackQuery('admin_manage_types', async (ctx) => {
    await ctx.answerCallbackQuery();
    await handleManageResourceTypes(ctx);
  });

  bot.callbackQuery('admin_type_add', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter('adminAddResourceTypeConversation');
  });

  bot.callbackQuery(/^admin_type_view_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const key = ctx.match[1];
    await handleViewResourceType(ctx, key);
  });

  bot.callbackQuery(/^admin_type_edit_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    ctx.session.editResourceTypeKey = ctx.match[1];
    await ctx.conversation.enter('adminEditResourceTypeLabelConversation');
  });

  bot.callbackQuery(/^admin_type_del_confirm_(.+)$/, async (ctx) => {
    const key = ctx.match[1];
    await handleDeleteResourceType(ctx, key);
  });

  bot.callbackQuery(/^admin_type_del_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const key = ctx.match[1];
    await handleConfirmDeleteResourceType(ctx, key);
  });

  bot.callbackQuery(/^admin_type_toggle_(.+)$/, async (ctx) => {
    const key = ctx.match[1];
    await handleToggleResourceTypeActive(ctx, key);
  });

  bot.callbackQuery(['admin_edit_cancel', 'admin_add_cancel'], async (ctx) => {
    await ctx.answerCallbackQuery({ text: 'Action cancelled.' });
    try {
      await ctx.editMessageText('❌ Operation cancelled.');
    } catch (e) {
      // ignore
    }
  });

  // Natural text search fallback for freeform queries (when not in a conversation)
  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text.trim();
    if (text.startsWith('/')) return; // ignore unknown commands

    if (text.length >= 3) {
      await executeSearch(ctx, text);
    } else {
      const dbUser = await getUserByTelegramId(ctx.from.id);
      const isAdmin = isUserAdmin(ctx.from.id, dbUser);
      const { getBrandConfig } = require('../services/settingsService');
      const brand = await getBrandConfig();
      await ctx.reply(
        `👋 *Welcome to ${brand.name}!*\n━━━━━━━━━━━━━━━━━━\nSend a course code or topic to search (e.g. \`STAT 151\` or \`regression\`), or browse using the menu:`,
        {
          parse_mode: 'Markdown',
          reply_markup: getMainMenuKeyboard(isAdmin, brand.links?.playStore)
        }
      );
    }
  });

  return bot;
}

module.exports = {
  createBot
};
