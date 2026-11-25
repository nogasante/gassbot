const { searchResources, getResourcesByCourse } = require('../../services/resourceService');
const { getCourseByCode } = require('../../services/courseService');
const { escapeMarkdown, appendResourceButtons } = require('../utils/format');
const { InlineKeyboard } = require('grammy');

async function handleSearchCommand(ctx) {
  const text = ctx.message ? ctx.message.text : '';
  const parts = text.split(' ').slice(1);
  const queryTerm = parts.join(' ').trim();

  if (!queryTerm) {
    await ctx.reply(
      `🔍 *Search GASS Academic Resources*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `Quickly find past questions, course slides, or software guides.\n\n` +
      `👉 *Usage:* Type \`/search <keyword>\`\n` +
      `*Examples:*\n` +
      `• \`/search MATH 171\`\n` +
      `• \`/search STAT 266\`\n` +
      `• \`/search regression\`\n` +
      `• \`/search python\``,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  await executeSearch(ctx, queryTerm);
}

async function handleSearchMenuPrompt(ctx) {
  const promptText = 
`🔍 *Find GASS Resources*
━━━━━━━━━━━━━━━━━━
Find past questions, lecture slides, syllabus, and software tutorials.

*Quick Options:*
1️⃣ Tap the buttons below to browse by level or category.
2️⃣ Or simply send any course code directly in this chat (e.g. \`STAT 266\`, \`MATH 171\`, or \`Python\`).

The bot will find your file or let you submit a request if it has not yet been uploaded.`;

  const keyboard = new InlineKeyboard()
    .text('📚 Browse Academic by Level', 'menu_academic')
    .row()
    .text('🚀 Browse Beyond Curriculum', 'menu_beyond')
    .row()
    .text('📝 Request a Resource', 'menu_request')
    .text('🏠 Main Menu', 'menu_main');

  if (ctx.callbackQuery) {
    await ctx.editMessageText(promptText, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } else {
    await ctx.reply(promptText, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }
}

async function executeSearch(ctx, queryTerm) {
  const cleanTerm = queryTerm.trim();
  const escapedQuery = escapeMarkdown(cleanTerm);

  // 1. Check if the query is a known Course Code (e.g. "math 172", "stat 266", "math171")
  const matchedCourse = await getCourseByCode(cleanTerm);

  if (matchedCourse) {
    const resources = await getResourcesByCourse(matchedCourse.id);

    if (resources.length === 0) {
      const keyboard = new InlineKeyboard()
        .text(`📝 Request ${matchedCourse.code}`, `req_course_${matchedCourse.id}`)
        .row()
        .text('🔙 Back to Courses', 'menu_academic')
        .text('🏠 Main Menu', 'menu_main');

      await ctx.reply(
        `📚 *${matchedCourse.code}: ${matchedCourse.title}*\n` +
        `Level ${matchedCourse.level} • Semester ${matchedCourse.semester}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `No files have been uploaded for *${matchedCourse.code}* yet.\n\n` +
        `Tap below to request materials for this course:`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        }
      );
      return;
    }

    // Has resources: show each file as its own labeled button
    const text =
`📂 *${escapeMarkdown(matchedCourse.code)}: ${escapeMarkdown(matchedCourse.title)}*
━━━━━━━━━━━━━━━━━━
Found *${resources.length}* material${resources.length === 1 ? '' : 's'}. Tap any file below to download:`;

    const keyboard = new InlineKeyboard();
    appendResourceButtons(keyboard, resources.slice(0, 15));

    if (resources.length > 15) {
      keyboard.text(`📚 View All ${resources.length} Files`, `res_list_${matchedCourse.id}`).row();
    }

    keyboard
      .text('🔙 Back to Courses', 'menu_academic')
      .text('🏠 Main Menu', 'menu_main');

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: keyboard
    });
    return;
  }

  // 2. Not an exact course code: General search across resource titles and descriptions
  const results = await searchResources(cleanTerm, 10);

  if (results.length === 0) {
    const encodedRaw = Buffer.from(cleanTerm.slice(0, 40)).toString('base64url');
    const keyboard = new InlineKeyboard()
      .text(`📝 Request Material`, `req_raw_${encodedRaw}`)
      .row()
      .text('🏠 Main Menu', 'menu_main');

    await ctx.reply(
      `🔍 *Search Results for:* "${escapedQuery}"\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `No uploaded materials found for *"${escapedQuery}"*.\n\n` +
      `Tap below to submit a request:`,
      {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }
    );
    return;
  }

  const text =
`🔍 *Search Results for:* "${escapedQuery}"
━━━━━━━━━━━━━━━━━━
Found *${results.length}* material${results.length === 1 ? '' : 's'}. Tap any file below to download:`;

  const keyboard = new InlineKeyboard();
  appendResourceButtons(keyboard, results, { includeCourseCode: true });

  keyboard.text('🏠 Main Menu', 'menu_main');

  await ctx.reply(text, {
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    reply_markup: keyboard
  });
}

module.exports = {
  handleSearchCommand,
  handleSearchMenuPrompt,
  executeSearch
};
