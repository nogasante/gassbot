const { searchResources, getResourcesByCourse } = require('../../services/resourceService');
const { getCourseByCode } = require('../../services/courseService');
const { escapeMarkdown } = require('../utils/format');
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
`🔍 *Search GASS Resources*
━━━━━━━━━━━━━━━━━━
Simply send any course code or keyword directly in the chat:

_Examples:_
• \`MATH 171\`
• \`STAT 266\`
• \`regression\`
• \`python\`

The bot will find the material or let you request it in 1 click!`;

  const keyboard = new InlineKeyboard()
    .text('🏠 Return to Main Menu', 'menu_main');

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
        .text(`📝 1-Click Request ${matchedCourse.code} Materials`, `req_course_${matchedCourse.id}`)
        .row()
        .text('🔙 Back to Courses', 'menu_academic')
        .text('🏠 Main Menu', 'menu_main');

      await ctx.reply(
        `📚 *${matchedCourse.code}: ${matchedCourse.title}*\n` +
        `Level ${matchedCourse.level} • Semester ${matchedCourse.semester}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `No files have been uploaded for *${matchedCourse.code}* yet.\n\n` +
        `💡 Tap the button below to alert the Academic Committee with 1 click:`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        }
      );
      return;
    }

    // Has resources: show them
    let text = 
`📂 *Resources for ${matchedCourse.code}: ${matchedCourse.title}*
━━━━━━━━━━━━━━━━━━\n`;

    const keyboard = new InlineKeyboard();

    resources.forEach((r, idx) => {
      const typeLabel = (r.resource_type || 'material').toUpperCase().replace('_', ' ');
      text += `\n*${idx + 1}. ${escapeMarkdown(r.title)}*\n`;
      text += `   🏷️ ${typeLabel} | 💾 ${(r.file_format || 'pdf').toUpperCase()}\n`;
      text += `   📥 Downloads: ${r.download_count}\n`;

      if (r.telegram_file_id) {
        keyboard.text(`📥 Send File #${idx + 1}`, `res_send_${r.id}`);
        if ((idx + 1) % 2 === 0) keyboard.row();
      } else if (r.file_url && r.file_url.startsWith('http')) {
        text += `   🔗 [Direct Link](${r.file_url})\n`;
        keyboard.url(`📥 Download #${idx + 1}`, r.file_url);
        if ((idx + 1) % 2 === 0) keyboard.row();
      }
    });

    keyboard.row()
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
      .text(`📝 1-Click Request "${cleanTerm.slice(0, 20)}"`, `req_raw_${encodedRaw}`)
      .row()
      .text('🏠 Main Menu', 'menu_main');

    await ctx.reply(
      `🔍 *Search Results for:* "${escapedQuery}"\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `No uploaded materials found matching *"${escapedQuery}"*.\n\n` +
      `💡 Tap below to auto-submit a request to the Academic Committee:`,
      {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }
    );
    return;
  }

  let text = 
`🔍 *Search Results for:* "${escapedQuery}"
━━━━━━━━━━━━━━━━━━\n`;

  const keyboard = new InlineKeyboard();

  results.forEach((r, idx) => {
    const coursePrefix = r.course_code ? `[${escapeMarkdown(r.course_code)}] ` : '';
    const safeTitle = escapeMarkdown(r.title);
    const safeType = escapeMarkdown((r.resource_type || 'material').toUpperCase().replace('_', ' '));
    text += `\n*${idx + 1}. ${coursePrefix}${safeTitle}*\n`;
    text += `   🏷️ ${safeType} | 📥 Downloads: ${r.download_count}\n`;

    if (r.telegram_file_id) {
      keyboard.text(`📥 Send File #${idx + 1}`, `res_send_${r.id}`);
      if ((idx + 1) % 2 === 0) keyboard.row();
    } else if (r.file_url && r.file_url.startsWith('http')) {
      text += `   🔗 [Download Resource](${r.file_url})\n`;
      keyboard.url(`📥 Download #${idx + 1}`, r.file_url);
      if ((idx + 1) % 2 === 0) keyboard.row();
    }
  });

  keyboard.row().text('🏠 Main Menu', 'menu_main');

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
