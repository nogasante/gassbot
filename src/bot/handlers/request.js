const { InlineKeyboard } = require('grammy');
const { getCoursesByLevelAndSemester, getCourseById, getDistinctLevels } = require('../../services/courseService');
const { getResourcesByCourse, getResourcesByBeyondCategory } = require('../../services/resourceService');
const { createRequest } = require('../../services/requestService');
const { findOrCreateUser } = require('../../services/userService');
const { getAllBeyondCategories, getBeyondCategoryByKey } = require('../../services/categoryService');
const { escapeMarkdown } = require('../utils/format');

/**
 * Main request menu.
 * Allows students to choose whether they need an academic course or beyond curriculum.
 */
async function handleRequestMenu(ctx) {
  const text = 
`📝 *Request Academic or Practical Material*
━━━━━━━━━━━━━━━━━━
Select what you need from the options below:`;

  const keyboard = new InlineKeyboard()
    .text('📚 Academic Courses', 'req_nav_acad')
    .row()
    .text('🚀 Beyond Curriculum (Tech & Skills)', 'req_nav_beyond')
    .row()
    .text('✍️ Type Custom Keyword / Topic', 'req_custom_text')
    .row()
    .text('🏠 Main Menu', 'menu_main');

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }
}

/**
 * Level selection for academic request.
 */
async function handleRequestLevelMenu(ctx) {
  const text = 
`📚 *Request Academic Material*
━━━━━━━━━━━━━━━━━━
Select your level:`;

  const levels = await getDistinctLevels();
  const list = levels && levels.length > 0 ? levels : [100, 200, 300, 400];
  const keyboard = new InlineKeyboard();

  list.forEach(lvl => {
    keyboard.text(`Level ${lvl}`, `req_lvl_${lvl}`).row();
  });

  keyboard
    .text('🔙 Back', 'menu_request')
    .text('🏠 Main Menu', 'menu_main');

  await ctx.editMessageText(text, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

/**
 * Semester selection for academic request.
 */
async function handleRequestSemesterMenu(ctx, level) {
  const text = 
`📚 *Level ${level}*
━━━━━━━━━━━━━━━━━━
Select the semester:`;

  const keyboard = new InlineKeyboard()
    .text('Semester 1', `req_sem_${level}_1`)
    .text('Semester 2', `req_sem_${level}_2`)
    .row()
    .text('🔙 Back to Levels', 'req_nav_acad')
    .text('🏠 Main Menu', 'menu_main');

  await ctx.editMessageText(text, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

/**
 * Course selection for academic request.
 */
async function handleRequestCourseList(ctx, level, semester) {
  const courses = await getCoursesByLevelAndSemester(level, semester);

  if (courses.length === 0) {
    await ctx.editMessageText(
      `No courses found for Level ${level} Semester ${semester}.`,
      {
        reply_markup: new InlineKeyboard()
          .text('🔙 Back to Semesters', `req_lvl_${level}`)
          .text('🏠 Main Menu', 'menu_main')
      }
    );
    return;
  }

  const text = 
`📚 *Level ${level} Semester ${semester}*
━━━━━━━━━━━━━━━━━━
Select a course below:`;

  const keyboard = new InlineKeyboard();
  courses.forEach((c) => {
    keyboard.text(`${c.code}: ${c.title.slice(0, 26)}`, `req_crs_pick_${c.id}`).row();
  });

  keyboard
    .text('🔙 Back to Semesters', `req_lvl_${level}`)
    .text('🏠 Main Menu', 'menu_main');

  await ctx.editMessageText(text, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

/**
 * Handles course selection for material request.
 * If files are already in database, displays them.
 * If not, creates the pending request for executives.
 */
async function handleRequestCoursePick(ctx, courseId) {
  const course = await getCourseById(courseId);
  if (!course) {
    await ctx.answerCallbackQuery({ text: 'Course not found.' });
    return;
  }

  const resources = await getResourcesByCourse(courseId);

  // Materials already exist
  if (resources.length > 0) {
    await ctx.answerCallbackQuery({ text: 'Materials found.' });

    let text = 
`📂 *Materials Available for ${course.code}*
━━━━━━━━━━━━━━━━━━
Course: *${course.code}* — ${course.title}
Uploaded files: ${resources.length}\n`;

    const keyboard = new InlineKeyboard();
    resources.forEach((r, idx) => {
      const typeLabel = (r.resource_type || 'material').toUpperCase().replace('_', ' ');
      text += `\n*${idx + 1}. ${escapeMarkdown(r.title)}*\n`;
      text += `   Type: ${typeLabel} | Format: ${(r.file_format || 'pdf').toUpperCase()}\n`;

      if (r.telegram_file_id) {
        keyboard.text(`📥 Send File #${idx + 1}`, `res_send_${r.id}`);
        if ((idx + 1) % 2 === 0) keyboard.row();
      } else if (r.file_url && r.file_url.startsWith('http')) {
        keyboard.url(`📥 Download #${idx + 1}`, r.file_url);
        if ((idx + 1) % 2 === 0) keyboard.row();
      }
    });

    keyboard.row()
      .text('📝 Request Another Course', 'req_nav_acad')
      .text('🏠 Main Menu', 'menu_main');

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: keyboard
    });
    return;
  }

  // Create request
  const dbUser = await findOrCreateUser({
    telegramId: ctx.from.id,
    username: ctx.from.username || null,
    firstName: ctx.from.first_name || '',
    lastName: ctx.from.last_name || ''
  });

  const created = await createRequest({
    userId: dbUser.id,
    courseCode: course.code,
    topicTitle: course.title,
    details: `Request for Level ${course.level} Semester ${course.semester}`
  });

  await ctx.answerCallbackQuery({ text: `Request #${created.id} submitted.` });

  const { getBrandConfig } = require('../../services/settingsService');
  const brand = await getBrandConfig();

  const text = 
`✅ *Request Submitted*
━━━━━━━━━━━━━━━━━━
Course: *${course.code}* — ${course.title}
Level: ${course.level} • Semester ${course.semester}
Request ID: #${created.id}

Your request has been sent to the ${brand.name} Academic Committee. You will receive the file once an executive uploads it.`;

  const keyboard = new InlineKeyboard()
    .text('📝 Request Another Course', 'req_nav_acad')
    .row()
    .text('🏠 Main Menu', 'menu_main');

  await ctx.editMessageText(text, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

/**
 * Beyond Curriculum request menu.
 */
async function handleRequestBeyondMenu(ctx) {
  const text = 
`🚀 *Beyond Curriculum Request*
━━━━━━━━━━━━━━━━━━
Select a category below:`;

  const categories = await getAllBeyondCategories();
  const keyboard = new InlineKeyboard();
  categories.forEach((cat, idx) => {
    keyboard.text(cat.label, `req_byd_pick_${cat.key}`);
    if ((idx + 1) % 2 === 0) keyboard.row();
  });

  keyboard.row()
    .text('🔙 Back', 'menu_request')
    .text('🏠 Main Menu', 'menu_main');

  await ctx.editMessageText(text, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

/**
 * Beyond Curriculum category selection.
 */
async function handleRequestBeyondPick(ctx, categoryKey) {
  const matched = await getBeyondCategoryByKey(categoryKey);
  const categoryLabel = matched ? matched.label : categoryKey.toUpperCase();

  const resources = await getResourcesByBeyondCategory(categoryKey);

  if (resources.length > 0) {
    await ctx.answerCallbackQuery({ text: 'Materials found.' });

    let text = 
`📂 *Resources Available for ${categoryLabel}*
━━━━━━━━━━━━━━━━━━\n`;

    const keyboard = new InlineKeyboard();
    resources.forEach((r, idx) => {
      text += `\n*${idx + 1}. ${escapeMarkdown(r.title)}*\n`;
      text += `   Type: ${escapeMarkdown(r.resource_type.toUpperCase())}\n`;
      if (r.file_url) {
        keyboard.url(`🔗 Open #${idx + 1}`, r.file_url);
        if ((idx + 1) % 2 === 0) keyboard.row();
      }
    });

    keyboard.row()
      .text('🚀 Request Another Topic', 'req_nav_beyond')
      .text('🏠 Main Menu', 'menu_main');

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: keyboard
    });
    return;
  }

  // Not in DB -> create request
  const dbUser = await findOrCreateUser({
    telegramId: ctx.from.id,
    username: ctx.from.username || null,
    firstName: ctx.from.first_name || '',
    lastName: ctx.from.last_name || ''
  });

  const created = await createRequest({
    userId: dbUser.id,
    courseCode: categoryKey.toUpperCase().slice(0, 20),
    topicTitle: categoryLabel,
    details: `Request for ${categoryLabel}`
  });

  await ctx.answerCallbackQuery({ text: `Request #${created.id} submitted.` });

  const text = 
`✅ *Request Submitted*
━━━━━━━━━━━━━━━━━━
Topic: *${categoryLabel}*
Request ID: #${created.id}

Your request has been received. You will be sent the guide once it is uploaded.`;

  const keyboard = new InlineKeyboard()
    .text('🚀 Request Another Topic', 'req_nav_beyond')
    .row()
    .text('🏠 Main Menu', 'menu_main');

  await ctx.editMessageText(text, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

module.exports = {
  handleRequestMenu,
  handleRequestLevelMenu,
  handleRequestSemesterMenu,
  handleRequestCourseList,
  handleRequestCoursePick,
  handleRequestBeyondMenu,
  handleRequestBeyondPick
};
