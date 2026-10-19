const { InlineKeyboard } = require('grammy');
const { createCourse, getCourseById, updateCourse, getDistinctLevels } = require('../../services/courseService');
const { createBeyondCategory, getBeyondCategoryByKey, updateBeyondCategory } = require('../../services/categoryService');
const { createResourceType, getResourceTypeByKey, updateResourceType } = require('../../services/resourceTypeService');
const { getResourceById, updateResource } = require('../../services/resourceService');
const { getUserByTelegramId } = require('../../services/userService');
const { isUserAdmin } = require('../handlers/admin');
const { getAdminPanelKeyboard } = require('../keyboards/admin');
const { escapeMarkdown } = require('../utils/format');

async function adminAddCourseConversation(conversation, ctx) {
  const telegramId = ctx.from.id;
  const dbUser = await conversation.external(() => getUserByTelegramId(telegramId));
  if (!isUserAdmin(telegramId, dbUser)) {
    await ctx.reply('⛔ Access denied.');
    return;
  }

  await ctx.reply(
    `📚 *Add New Course to GASS Curriculum*\n━━━━━━━━━━━━━━━━━━\n` +
    `👉 *Step 1/5:* Enter the *Course Code* (e.g. \`MATH 285\` or \`STAT 375\`):\n\n_(Send /cancel to abort)_`,
    { parse_mode: 'Markdown' }
  );

  const codeMsg = await conversation.waitFor(':text');
  const code = codeMsg.message.text.trim().toUpperCase();
  if (code === '/CANCEL' || code.startsWith('/')) {
    await ctx.reply('❌ Add course cancelled.');
    return;
  }

  await ctx.reply(
    `👉 *Step 2/5:* Enter the *Course Title* (e.g. \`Bayesian Data Analysis\`):\n\n_(Send /cancel to abort)_`,
    { parse_mode: 'Markdown' }
  );

  const titleMsg = await conversation.waitFor(':text');
  const title = titleMsg.message.text.trim();
  if (title === '/cancel' || title.startsWith('/')) {
    await ctx.reply('❌ Add course cancelled.');
    return;
  }

  // Level selection
  const levels = await conversation.external(() => getDistinctLevels());
  const list = levels && levels.length > 0 ? levels : [100, 200, 300, 400];
  const levelKb = new InlineKeyboard();
  list.forEach(lvl => {
    levelKb.text(`Level ${lvl}`, `admin_add_lvl_${lvl}`);
  });
  levelKb.row().text('❌ Cancel', 'admin_add_cancel');

  await ctx.reply(`👉 *Step 3/5:* Select Academic Level:`, { reply_markup: levelKb });

  const lvlCtx = await conversation.waitForCallbackQuery(/^admin_add_(lvl_\d+|cancel)$/);
  await lvlCtx.answerCallbackQuery();
  if (lvlCtx.callbackQuery.data === 'admin_add_cancel') {
    await ctx.reply('❌ Add course cancelled.');
    return;
  }
  const level = parseInt(lvlCtx.callbackQuery.data.replace('admin_add_lvl_', ''), 10);

  // Semester selection
  const semKb = new InlineKeyboard()
    .text('Semester 1', 'admin_add_sem_1')
    .text('Semester 2', 'admin_add_sem_2')
    .row()
    .text('❌ Cancel', 'admin_add_cancel');

  await ctx.reply(`👉 *Step 4/5:* Select Semester:`, { reply_markup: semKb });

  const semCtx = await conversation.waitForCallbackQuery(/^admin_add_(sem_\d+|cancel)$/);
  await semCtx.answerCallbackQuery();
  if (semCtx.callbackQuery.data === 'admin_add_cancel') {
    await ctx.reply('❌ Add course cancelled.');
    return;
  }
  const semester = parseInt(semCtx.callbackQuery.data.replace('admin_add_sem_', ''), 10);

  // Description
  await ctx.reply(
    `👉 *Step 5/5:* Enter a brief *Course Description* (or send \`skip\`):\n\n_(Send /cancel to abort)_`,
    { parse_mode: 'Markdown' }
  );

  const descMsg = await conversation.waitFor(':text');
  let description = descMsg.message.text.trim();
  if (description === '/cancel' || description.startsWith('/cancel')) {
    await ctx.reply('❌ Add course cancelled.');
    return;
  }
  if (description.toLowerCase() === 'skip') {
    description = `${code} - ${title}`;
  }

  // Create course in DB
  try {
    const created = await conversation.external(() => createCourse({
      code,
      title,
      level,
      semester,
      description
    }));

    await ctx.reply(
      `🎉 *Course Added Successfully!*\n━━━━━━━━━━━━━━━━━━\n` +
      `📌 *Code:* ${escapeMarkdown(created.code)}\n` +
      `📖 *Title:* ${escapeMarkdown(created.title)}\n` +
      `🏛️ *Level:* ${created.level} | *Semester:* ${created.semester}\n\n` +
      `Students can now see and search this course immediately!`,
      {
        parse_mode: 'Markdown',
        reply_markup: getAdminPanelKeyboard()
      }
    );
  } catch (err) {
    console.error('Error creating course:', err);
    await ctx.reply('❌ Failed to add course. Please check if the course already exists.');
  }
}

async function adminAddCategoryConversation(conversation, ctx) {
  const telegramId = ctx.from.id;
  const dbUser = await conversation.external(() => getUserByTelegramId(telegramId));
  if (!isUserAdmin(telegramId, dbUser)) {
    await ctx.reply('⛔ Access denied.');
    return;
  }

  await ctx.reply(
    `🚀 *Add Beyond Curriculum Category*\n━━━━━━━━━━━━━━━━━━\n` +
    `👉 *Step 1/3:* Enter unique category key (e.g. \`julia\`, \`tableau\`, \`git\`):\n\n_(Send /cancel to abort)_`,
    { parse_mode: 'Markdown' }
  );

  const keyMsg = await conversation.waitFor(':text');
  const key = keyMsg.message.text.trim().toLowerCase().replace(/\s+/g, '_');
  if (key === '/cancel' || key.startsWith('/')) {
    await ctx.reply('❌ Add category cancelled.');
    return;
  }

  await ctx.reply(
    `👉 *Step 2/3:* Enter button label with emoji (e.g. \`🟣 Julia Scientific Computing\`):\n\n_(Send /cancel to abort)_`,
    { parse_mode: 'Markdown' }
  );

  const labelMsg = await conversation.waitFor(':text');
  const label = labelMsg.message.text.trim();
  if (label === '/cancel' || label.startsWith('/')) {
    await ctx.reply('❌ Add category cancelled.');
    return;
  }

  await ctx.reply(
    `👉 *Step 3/3:* Enter short description (e.g. \`High-performance numerical computing for statistics\`):\n\n_(Send /cancel to abort)_`,
    { parse_mode: 'Markdown' }
  );

  const descMsg = await conversation.waitFor(':text');
  const description = descMsg.message.text.trim();
  if (description === '/cancel' || description.startsWith('/')) {
    await ctx.reply('❌ Add category cancelled.');
    return;
  }

  try {
    const created = await conversation.external(() => createBeyondCategory({
      key,
      label,
      description,
      icon: label.split(' ')[0] || '🚀'
    }));

    await ctx.reply(
      `🎉 *Beyond Category Created!*\n━━━━━━━━━━━━━━━━━━\n` +
      `🏷️ *Key:* \`${created.key}\`\n` +
      `📌 *Label:* ${escapeMarkdown(created.label)}\n` +
      `📝 *Description:* ${escapeMarkdown(created.description || '')}\n\n` +
      `It is now live in the Beyond Curriculum Hub for all students!`,
      {
        parse_mode: 'Markdown',
        reply_markup: getAdminPanelKeyboard()
      }
    );
  } catch (err) {
    console.error('Error creating category:', err);
    await ctx.reply('❌ Failed to add category.');
  }
}

async function adminAddResourceTypeConversation(conversation, ctx) {
  const telegramId = ctx.from.id;
  const dbUser = await conversation.external(() => getUserByTelegramId(telegramId));
  if (!isUserAdmin(telegramId, dbUser)) {
    await ctx.reply('⛔ Access denied.');
    return;
  }

  await ctx.reply(
    `📑 *Add New Resource Type*\n━━━━━━━━━━━━━━━━━━\n` +
    `👉 *Step 1/2:* Enter unique type key (e.g. \`cheatsheet\`, \`lab_script\`, \`quiz\`):\n\n_(Send /cancel to abort)_`,
    { parse_mode: 'Markdown' }
  );

  const keyMsg = await conversation.waitFor(':text');
  const key = keyMsg.message.text.trim().toLowerCase().replace(/\s+/g, '_');
  if (key === '/cancel' || key.startsWith('/')) {
    await ctx.reply('❌ Add resource type cancelled.');
    return;
  }

  await ctx.reply(
    `👉 *Step 2/2:* Enter button label with emoji (e.g. \`📑 Formula Cheatsheet\`):\n\n_(Send /cancel to abort)_`,
    { parse_mode: 'Markdown' }
  );

  const labelMsg = await conversation.waitFor(':text');
  const label = labelMsg.message.text.trim();
  if (label === '/cancel' || label.startsWith('/')) {
    await ctx.reply('❌ Add resource type cancelled.');
    return;
  }

  try {
    const created = await conversation.external(() => createResourceType({
      key,
      label,
      icon: label.split(' ')[0] || '📑'
    }));

    await ctx.reply(
      `🎉 *Resource Type Created!*\n━━━━━━━━━━━━━━━━━━\n` +
      `🏷️ *Key:* \`${created.key}\`\n` +
      `📌 *Label:* ${escapeMarkdown(created.label)}\n\n` +
      `It is now available in upload workflows and resource categorization!`,
      {
        parse_mode: 'Markdown',
        reply_markup: getAdminPanelKeyboard()
      }
    );
  } catch (err) {
    console.error('Error creating resource type:', err);
    await ctx.reply('❌ Failed to add resource type.');
  }
}

async function adminEditCourseTitleConversation(conversation, ctx) {
  const telegramId = ctx.from.id;
  const dbUser = await conversation.external(() => getUserByTelegramId(telegramId));
  if (!isUserAdmin(telegramId, dbUser)) {
    await ctx.reply('⛔ Access denied.');
    return;
  }

  let courseId = (conversation.session && conversation.session.editCourseId)
    || (ctx.session && ctx.session.editCourseId)
    || (ctx.match && ctx.match[1])
    || (ctx.callbackQuery?.data?.match(/^admin_crs_edit_title_(\d+)$/)?.[1]);
  courseId = parseInt(courseId, 10);
  const course = await conversation.external(() => getCourseById(courseId));
  if (!course) {
    await ctx.reply('❌ Course not found.');
    return;
  }

  const cancelKb = new InlineKeyboard().text('❌ Cancel', 'admin_edit_cancel');

  await ctx.reply(
    `✏️ *Edit Course Name*\n━━━━━━━━━━━━━━━━━━\n` +
    `Course: *${escapeMarkdown(course.code)}*\n` +
    `Current Title: *${escapeMarkdown(course.title)}*\n\n` +
    `👉 Enter the *new course title*:\n\n_(Send /cancel to abort)_`,
    { parse_mode: 'Markdown', reply_markup: cancelKb }
  );

  const input = await conversation.waitFor([':text', 'callback_query:data']);
  if (input.callbackQuery) {
    await input.answerCallbackQuery();
    await input.editMessageText('❌ Edit cancelled.');
    return;
  }

  const newTitle = input.message.text.trim();
  if (newTitle.toLowerCase() === '/cancel' || newTitle.startsWith('/')) {
    await ctx.reply('❌ Edit cancelled.');
    return;
  }

  if (newTitle.length < 2) {
    await ctx.reply('❌ Course title cannot be empty or too short. Edit cancelled.');
    return;
  }
  if (newTitle.length > 255) {
    await ctx.reply('❌ Course title cannot exceed 255 characters. Edit cancelled.');
    return;
  }

  try {
    const updated = await conversation.external(() => updateCourse(courseId, { title: newTitle }));
    await ctx.reply(
      `🎉 *Course Name Updated Successfully!*\n━━━━━━━━━━━━━━━━━━\n` +
      `📌 *Code:* ${escapeMarkdown(updated.code)}\n` +
      `📖 *New Title:* ${escapeMarkdown(updated.title)}\n` +
      `🏛️ *Level:* ${updated.level} | *Semester:* ${updated.semester}`,
      {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard()
          .text('🔍 View Course Details', `admin_crs_view_${courseId}`)
          .text('🔙 Back to Level Courses', `admin_crs_lvl_${updated.level}`)
          .row()
          .text('🏠 Admin Panel', 'menu_admin')
      }
    );
  } catch (err) {
    console.error('Error updating course title:', err);
    await ctx.reply('❌ Failed to update course name.');
  } finally {
    if (ctx.session) delete ctx.session.editCourseId;
    if (conversation.session) delete conversation.session.editCourseId;
  }
}

async function adminEditCourseCodeConversation(conversation, ctx) {
  const telegramId = ctx.from.id;
  const dbUser = await conversation.external(() => getUserByTelegramId(telegramId));
  if (!isUserAdmin(telegramId, dbUser)) {
    await ctx.reply('⛔ Access denied.');
    return;
  }

  let courseId = (conversation.session && conversation.session.editCourseId)
    || (ctx.session && ctx.session.editCourseId)
    || (ctx.match && ctx.match[1])
    || (ctx.callbackQuery?.data?.match(/^admin_crs_edit_code_(\d+)$/)?.[1]);
  courseId = parseInt(courseId, 10);
  const course = await conversation.external(() => getCourseById(courseId));
  if (!course) {
    await ctx.reply('❌ Course not found.');
    return;
  }

  const cancelKb = new InlineKeyboard().text('❌ Cancel', 'admin_edit_cancel');

  await ctx.reply(
    `✏️ *Edit Course Code*\n━━━━━━━━━━━━━━━━━━\n` +
    `Current Code: *${escapeMarkdown(course.code)}*\n` +
    `Title: *${escapeMarkdown(course.title)}*\n\n` +
    `👉 Enter the *new course code* (e.g. \`MATH 285\` or \`STAT 375\`):\n\n_(Send /cancel to abort)_`,
    { parse_mode: 'Markdown', reply_markup: cancelKb }
  );

  const input = await conversation.waitFor([':text', 'callback_query:data']);
  if (input.callbackQuery) {
    await input.answerCallbackQuery();
    await input.editMessageText('❌ Edit cancelled.');
    return;
  }

  const newCode = input.message.text.trim().toUpperCase().replace(/\s+/g, ' ');
  if (newCode === '/CANCEL' || newCode.startsWith('/')) {
    await ctx.reply('❌ Edit cancelled.');
    return;
  }

  if (newCode.length < 3) {
    await ctx.reply('❌ Course code cannot be empty or too short. Edit cancelled.');
    return;
  }
  if (newCode.length > 50) {
    await ctx.reply('❌ Course code cannot exceed 50 characters. Edit cancelled.');
    return;
  }

  try {
    const updated = await conversation.external(() => updateCourse(courseId, { code: newCode }));
    await ctx.reply(
      `🎉 *Course Code Updated Successfully!*\n━━━━━━━━━━━━━━━━━━\n` +
      `📌 *New Code:* ${escapeMarkdown(updated.code)}\n` +
      `📖 *Title:* ${escapeMarkdown(updated.title)}\n` +
      `🏛️ *Level:* ${updated.level} | *Semester:* ${updated.semester}`,
      {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard()
          .text('🔍 View Course Details', `admin_crs_view_${courseId}`)
          .text('🔙 Back to Level Courses', `admin_crs_lvl_${updated.level}`)
          .row()
          .text('🏠 Admin Panel', 'menu_admin')
      }
    );
  } catch (err) {
    console.error('Error updating course code:', err);
    await ctx.reply('❌ Failed to update course code.');
  } finally {
    if (ctx.session) delete ctx.session.editCourseId;
    if (conversation.session) delete conversation.session.editCourseId;
  }
}

async function adminEditResourceTitleConversation(conversation, ctx) {
  const telegramId = ctx.from.id;
  const dbUser = await conversation.external(() => getUserByTelegramId(telegramId));
  if (!isUserAdmin(telegramId, dbUser)) {
    await ctx.reply('⛔ Access denied.');
    return;
  }

  let resourceId = (conversation.session && conversation.session.editResourceId)
    || (ctx.session && ctx.session.editResourceId)
    || (ctx.match && ctx.match[1])
    || (ctx.callbackQuery?.data?.match(/^admin_res_edit_title_(\d+)$/)?.[1]);
  resourceId = parseInt(resourceId, 10);
  const resource = await conversation.external(() => getResourceById(resourceId));
  if (!resource) {
    await ctx.reply('❌ Resource file not found.');
    return;
  }

  const cancelKb = new InlineKeyboard().text('❌ Cancel', 'admin_edit_cancel');

  await ctx.reply(
    `✏️ *Rename / Edit File Title*\n━━━━━━━━━━━━━━━━━━\n` +
    `Current Title: *${escapeMarkdown(resource.title)}*\n` +
    `Type: *${escapeMarkdown(resource.resource_type)}*\n\n` +
    `👉 Enter the *new title* for this file:\n\n_(Send /cancel to abort)_`,
    { parse_mode: 'Markdown', reply_markup: cancelKb }
  );

  const input = await conversation.waitFor([':text', 'callback_query:data']);
  if (input.callbackQuery) {
    await input.answerCallbackQuery();
    await input.editMessageText('❌ Edit cancelled.');
    return;
  }

  const newTitle = input.message.text.trim();
  if (newTitle.toLowerCase() === '/cancel' || newTitle.startsWith('/')) {
    await ctx.reply('❌ Edit cancelled.');
    return;
  }

  if (newTitle.length < 2) {
    await ctx.reply('❌ File title cannot be empty or too short. Edit cancelled.');
    return;
  }
  if (newTitle.length > 255) {
    await ctx.reply('❌ File title cannot exceed 255 characters. Edit cancelled.');
    return;
  }

  try {
    const updated = await conversation.external(() => updateResource(resourceId, { title: newTitle }));
    await ctx.reply(
      `🎉 *File Renamed Successfully!*\n━━━━━━━━━━━━━━━━━━\n` +
      `📄 *New Title:* ${escapeMarkdown(updated.title)}\n` +
      `📑 *Type:* ${escapeMarkdown(updated.resource_type)}\n` +
      `📥 *Format:* ${escapeMarkdown(updated.file_format || 'N/A')}`,
      {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard()
          .text('🔍 View File Details', `admin_res_view_${resourceId}`)
          .row()
          .text('📂 Manage Uploaded Files', 'admin_manage_resources')
          .text('🏠 Admin Panel', 'menu_admin')
      }
    );
  } catch (err) {
    console.error('Error updating resource title:', err);
    await ctx.reply('❌ Failed to rename file.');
  } finally {
    if (ctx.session) delete ctx.session.editResourceId;
    if (conversation.session) delete conversation.session.editResourceId;
  }
}

async function adminEditCategoryLabelConversation(conversation, ctx) {
  const telegramId = ctx.from.id;
  const dbUser = await conversation.external(() => getUserByTelegramId(telegramId));
  if (!isUserAdmin(telegramId, dbUser)) {
    await ctx.reply('⛔ Access denied.');
    return;
  }

  let categoryKey = (conversation.session && conversation.session.editCategoryKey)
    || (ctx.session && ctx.session.editCategoryKey)
    || (ctx.match && ctx.match[1])
    || (ctx.callbackQuery?.data?.match(/^admin_cat_edit_(.+)$/)?.[1]);

  const cat = await conversation.external(() => getBeyondCategoryByKey(categoryKey));
  if (!cat) {
    await ctx.reply('❌ Category not found.');
    return;
  }

  const cancelKb = new InlineKeyboard().text('❌ Cancel', 'admin_edit_cancel');

  await ctx.reply(
    `✏️ *Edit Category Label*\n━━━━━━━━━━━━━━━━━━\n` +
    `Key: \`${cat.key}\`\n` +
    `Current Label: *${escapeMarkdown(cat.label)}*\n\n` +
    `👉 Enter the *new label with emoji* (e.g. \`📊 R Programming & Tidyverse\`):\n\n_(Send /cancel to abort)_`,
    { parse_mode: 'Markdown', reply_markup: cancelKb }
  );

  const input = await conversation.waitFor([':text', 'callback_query:data']);
  if (input.callbackQuery) {
    await input.answerCallbackQuery();
    await input.editMessageText('❌ Edit cancelled.');
    return;
  }

  const newLabel = input.message.text.trim();
  if (newLabel.toLowerCase() === '/cancel' || newLabel.startsWith('/')) {
    await ctx.reply('❌ Edit cancelled.');
    return;
  }

  if (newLabel.length < 2) {
    await ctx.reply('❌ Category label cannot be empty or too short. Edit cancelled.');
    return;
  }
  if (newLabel.length > 255) {
    await ctx.reply('❌ Category label cannot exceed 255 characters. Edit cancelled.');
    return;
  }

  const currentIcon = cat.icon || '🚀';
  const firstWord = newLabel.split(' ')[0] || '';
  const hasEmoji = /\p{Extended_Pictographic}/u.test(firstWord);
  const icon = hasEmoji ? firstWord : currentIcon;

  try {
    const updated = await conversation.external(() => updateBeyondCategory(categoryKey, {
      label: newLabel,
      icon
    }));
    await ctx.reply(
      `🎉 *Category Label Updated Successfully!*\n━━━━━━━━━━━━━━━━━━\n` +
      `🏷️ *Key:* \`${updated.key}\`\n` +
      `📌 *New Label:* ${escapeMarkdown(updated.label)}`,
      {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard()
          .text('🔍 View Category Details', `admin_cat_view_${categoryKey}`)
          .row()
          .text('🔙 Back to Categories', 'admin_manage_categories')
          .text('🏠 Admin Panel', 'menu_admin')
      }
    );
  } catch (err) {
    console.error('Error updating category label:', err);
    await ctx.reply('❌ Failed to update category label.');
  } finally {
    if (ctx.session) delete ctx.session.editCategoryKey;
    if (conversation.session) delete conversation.session.editCategoryKey;
  }
}

async function adminEditResourceTypeLabelConversation(conversation, ctx) {
  const telegramId = ctx.from.id;
  const dbUser = await conversation.external(() => getUserByTelegramId(telegramId));
  if (!isUserAdmin(telegramId, dbUser)) {
    await ctx.reply('⛔ Access denied.');
    return;
  }

  let typeKey = (conversation.session && conversation.session.editResourceTypeKey)
    || (ctx.session && ctx.session.editResourceTypeKey)
    || (ctx.match && ctx.match[1])
    || (ctx.callbackQuery?.data?.match(/^admin_type_edit_(.+)$/)?.[1]);

  const type = await conversation.external(() => getResourceTypeByKey(typeKey));
  if (!type) {
    await ctx.reply('❌ Resource type not found.');
    return;
  }

  const cancelKb = new InlineKeyboard().text('❌ Cancel', 'admin_edit_cancel');

  await ctx.reply(
    `✏️ *Edit Resource Type Label*\n━━━━━━━━━━━━━━━━━━\n` +
    `Key: \`${type.key}\`\n` +
    `Current Label: *${escapeMarkdown(type.label)}*\n\n` +
    `👉 Enter the *new label with emoji* (e.g. \`📑 Past Questions & Solutions\`):\n\n_(Send /cancel to abort)_`,
    { parse_mode: 'Markdown', reply_markup: cancelKb }
  );

  const input = await conversation.waitFor([':text', 'callback_query:data']);
  if (input.callbackQuery) {
    await input.answerCallbackQuery();
    await input.editMessageText('❌ Edit cancelled.');
    return;
  }

  const newLabel = input.message.text.trim();
  if (newLabel.toLowerCase() === '/cancel' || newLabel.startsWith('/')) {
    await ctx.reply('❌ Edit cancelled.');
    return;
  }

  if (newLabel.length < 2) {
    await ctx.reply('❌ Resource type label cannot be empty or too short. Edit cancelled.');
    return;
  }
  if (newLabel.length > 255) {
    await ctx.reply('❌ Resource type label cannot exceed 255 characters. Edit cancelled.');
    return;
  }

  const currentIcon = type.icon || '📑';
  const firstWord = newLabel.split(' ')[0] || '';
  const hasEmoji = /\p{Extended_Pictographic}/u.test(firstWord);
  const icon = hasEmoji ? firstWord : currentIcon;

  try {
    const updated = await conversation.external(() => updateResourceType(typeKey, {
      label: newLabel,
      icon
    }));
    await ctx.reply(
      `🎉 *Resource Type Updated Successfully!*\n━━━━━━━━━━━━━━━━━━\n` +
      `🏷️ *Key:* \`${updated.key}\`\n` +
      `📌 *New Label:* ${escapeMarkdown(updated.label)}`,
      {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard()
          .text('🔍 View Resource Type', `admin_type_view_${typeKey}`)
          .row()
          .text('🔙 Back to Resource Types', 'admin_manage_types')
          .text('🏠 Admin Panel', 'menu_admin')
      }
    );
  } catch (err) {
    console.error('Error updating resource type label:', err);
    await ctx.reply('❌ Failed to update resource type label.');
  } finally {
    if (ctx.session) delete ctx.session.editResourceTypeKey;
    if (conversation.session) delete conversation.session.editResourceTypeKey;
  }
}

async function adminAddTopicConversation(conversation, ctx) {
  const telegramId = ctx.from.id;
  const dbUser = await conversation.external(() => getUserByTelegramId(telegramId));
  if (!isUserAdmin(telegramId, dbUser)) {
    await ctx.reply('⛔ Access denied.');
    return;
  }

  const initialData = ctx.callbackQuery?.data || '';
  const match = initialData.match(/^admin_byd_add_topic_([a-z0-9_-]+)$/);
  const pillarKey = match ? match[1] : (ctx.session?.addTopicPillarKey || 'programming_tools');

  const { getBeyondCategoryByKey, createSubTopic } = require('../../services/categoryService');
  const cat = await conversation.external(() => getBeyondCategoryByKey(pillarKey));
  const catName = cat ? cat.label : 'Category';

  await ctx.reply(
    `🚀 *Add New Topic to ${escapeMarkdown(catName)}*\n━━━━━━━━━━━━━━━━━━\n` +
    `👉 *Step 1/2:* Enter the topic title (e.g. \`Power BI\` or \`Git & GitHub\`):\n\n_(Send /cancel to abort)_`,
    { parse_mode: 'Markdown' }
  );

  const titleMsg = await conversation.waitFor(':text');
  const title = titleMsg.message.text.trim();
  if (title === '/cancel' || title.startsWith('/')) {
    await ctx.reply('❌ Add topic cancelled.');
    return;
  }

  await ctx.reply(
    `👉 *Step 2/2:* Enter a short description (optional):\n\n_(Send /skip to leave blank or /cancel to abort)_`,
    { parse_mode: 'Markdown' }
  );

  const descMsg = await conversation.waitFor(':text');
  const rawDesc = descMsg.message.text.trim();
  if (rawDesc === '/cancel') {
    await ctx.reply('❌ Add topic cancelled.');
    return;
  }
  const desc = rawDesc === '/skip' ? '' : rawDesc;

  const keySlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 30);

  try {
    const created = await conversation.external(() => createSubTopic({
      pillarKey,
      key: keySlug,
      label: title,
      description: desc,
      icon: '📌'
    }));

    await ctx.reply(
      `🎉 *Topic Created Successfully!*\n━━━━━━━━━━━━━━━━━━\n` +
      `📌 *Topic:* ${escapeMarkdown(created.label)}\n` +
      `🚀 *Category:* ${escapeMarkdown(catName)}\n\n` +
      `You can now upload materials directly to this topic.`,
      {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard()
          .text(`➕ Upload Material to ${created.label}`, `admin_byd_add_res_${created.key}`)
          .row()
          .text(`🔙 Back to ${catName}`, `admin_res_byd_${pillarKey}`)
          .text('🏠 Admin Panel', 'menu_admin')
      }
    );
  } catch (err) {
    console.error('Error creating topic in conversation:', err);
    await ctx.reply('❌ Failed to create topic. Key may already exist.');
  }
}

module.exports = {
  adminAddCourseConversation,
  adminAddCategoryConversation,
  adminAddResourceTypeConversation,
  adminAddTopicConversation,
  adminEditCourseTitleConversation,
  adminEditCourseCodeConversation,
  adminEditResourceTitleConversation,
  adminEditCategoryLabelConversation,
  adminEditResourceTypeLabelConversation
};
