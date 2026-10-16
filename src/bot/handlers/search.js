const { searchResources } = require('../../services/resourceService');
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
      `• \`/search STAT 151\`\n` +
      `• \`/search regression\`\n` +
      `• \`/search python\`\n` +
      `• \`/search probability\``,
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
To search for materials, send a command in this format:

\`/search <course or keyword>\`

_Examples:_
• \`/search STAT 253\`
• \`/search regression\`
• \`/search latex\``;

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
  const results = await searchResources(queryTerm, 10);
  const escapedQuery = escapeMarkdown(queryTerm);

  if (results.length === 0) {
    const keyboard = new InlineKeyboard()
      .text('📝 Request this Resource', 'menu_request')
      .row()
      .text('🏠 Main Menu', 'menu_main');

    await ctx.reply(
      `🔍 *Search Results for:* "${escapedQuery}"\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `No resources matched your search query.\n\n` +
      `💡 _You can submit a direct resource request to the Academic Committee!_`,
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
    const safeType = escapeMarkdown(r.resource_type.toUpperCase().replace('_', ' '));
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
