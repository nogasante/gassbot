const { Bot, session } = require('grammy');
const { conversations, createConversation } = require('@grammyjs/conversations');
const { config } = require('../config');

const { handleStart } = require('./handlers/start');
const {
  handleAcademicMenu,
  handleLevelSelect,
  handleSemesterSelect,
  handleCourseSelect,
  handleResourceList
} = require('./handlers/academic');
const { handleBeyondMenu, handleBeyondCategorySelect } = require('./handlers/beyond');
const { handleSearchCommand, handleSearchMenuPrompt, executeSearch } = require('./handlers/search');
const { handleNotificationsMenu, handleNotificationToggle, handleAcademicLevelPreference } = require('./handlers/notifications');
const { handleAppInfo } = require('./handlers/app');
const { handleHelp } = require('./handlers/help');
const {
  handleAdminMenu,
  handleListPendingRequests,
  handleViewRequest,
  handleModerateRequest,
  handleAdminStats
} = require('./handlers/admin');

const { requestResourceConversation } = require('./conversations/requestConversation');
const { broadcastConversation } = require('./conversations/broadcastConversation');
const { addResourceConversation } = require('./conversations/addResourceConversation');
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

  // Global Error Handler
  bot.catch((err) => {
    console.error('Bot Error encountered in update:', err.ctx?.update?.update_id, err.error);
  });

  // Base Commands
  bot.command('start', handleStart);
  bot.command('menu', handleStart);
  bot.command('courses', handleAcademicMenu);
  bot.command('beyond', handleBeyondMenu);
  bot.command('search', handleSearchCommand);
  bot.command('request', async (ctx) => {
    await ctx.conversation.enter('requestResourceConversation');
  });
  bot.command('notifications', handleNotificationsMenu);
  bot.command('app', handleAppInfo);
  bot.command('help', handleHelp);
  bot.command('about', handleHelp);
  bot.command('admin', handleAdminMenu);

  // Reply Keyboard Text Listeners
  bot.hears('📚 Academic Resources', handleAcademicMenu);
  bot.hears('🚀 Beyond Curriculum', handleBeyondMenu);
  bot.hears('🔍 Search', handleSearchMenuPrompt);
  bot.hears('📝 Request Resource', async (ctx) => {
    await ctx.conversation.enter('requestResourceConversation');
  });
  bot.hears('🔔 Notifications', handleNotificationsMenu);
  bot.hears('🌐 Web App', handleAppInfo);
  bot.hears('ℹ️ About', handleHelp);

  // Callback Query Handlers
  bot.callbackQuery('menu_main', async (ctx) => {
    await ctx.answerCallbackQuery();
    const dbUser = await getUserByTelegramId(ctx.from.id);
    const isAdmin = isUserAdmin(ctx.from.id, dbUser);
    await ctx.editMessageText(
      `🇬🇭 *GASSBot Main Navigation*\n━━━━━━━━━━━━━━━━━━\n_"${config.brand.slogan}"_\n\nPlease select an option below:`,
      {
        parse_mode: 'Markdown',
        reply_markup: getMainMenuKeyboard(isAdmin)
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
    await ctx.conversation.enter('requestResourceConversation');
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

  // Beyond Curriculum Sub-navigation
  bot.callbackQuery(/^beyond_cat_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const categoryKey = ctx.match[1];
    await handleBeyondCategorySelect(ctx, categoryKey);
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

  bot.callbackQuery(/^admin_req_(approve|reject)_(\d+)$/, async (ctx) => {
    const action = ctx.match[1];
    const requestId = parseInt(ctx.match[2], 10);
    await handleModerateRequest(ctx, requestId, action);
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

  // Natural text search fallback for freeform queries (when not in a conversation)
  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text.trim();
    if (text.startsWith('/')) return; // ignore unknown commands

    if (text.length >= 3) {
      await executeSearch(ctx, text);
    } else {
      const dbUser = await getUserByTelegramId(ctx.from.id);
      const isAdmin = isUserAdmin(ctx.from.id, dbUser);
      await ctx.reply(
        `👋 *Welcome to GASSBot!*\n━━━━━━━━━━━━━━━━━━\nSend a course code or topic to search (e.g. \`STAT 151\` or \`regression\`), or browse using the menu:`,
        {
          parse_mode: 'Markdown',
          reply_markup: getMainMenuKeyboard(isAdmin)
        }
      );
    }
  });

  return bot;
}

module.exports = {
  createBot
};
