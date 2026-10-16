const { createRequest } = require('../../services/requestService');
const { searchResources } = require('../../services/resourceService');
const { findOrCreateUser } = require('../../services/userService');
const { escapeMarkdown } = require('../utils/format');
const { InlineKeyboard } = require('grammy');

async function requestResourceConversation(conversation, ctx) {
  const telegramId = ctx.from.id;
  const dbUser = await conversation.external(() =>
    findOrCreateUser({
      telegramId,
      username: ctx.from?.username || null,
      firstName: ctx.from?.first_name || '',
      lastName: ctx.from?.last_name || ''
    })
  );

  await ctx.reply(
    `🔍 *Instant Resource Finder & Request*\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `What material do you need?\n\n` +
    `Simply type the course or topic below (e.g. \`MATH 171\`, \`STAT 266 past questions\`, or \`Python\`):\n\n` +
    `_(Or send /cancel to return)_`,
    { parse_mode: 'Markdown' }
  );

  const queryMsg = await conversation.waitFor(':text');
  const queryText = queryMsg.message.text.trim();

  if (queryText === '/cancel' || queryText.startsWith('/')) {
    await ctx.reply('❌ Cancelled.');
    return;
  }

  // 1. Instant check: Does it already exist in the database?
  const existing = await conversation.external(() => searchResources(queryText, 5));

  if (existing.length > 0) {
    const keyboard = new InlineKeyboard();
    let text = `🎉 *Found ${existing.length} matching material(s) for "${escapeMarkdown(queryText)}"!*\n━━━━━━━━━━━━━━━━━━\n`;

    existing.forEach((r, idx) => {
      const typeLabel = (r.resource_type || 'material').toUpperCase().replace('_', ' ');
      text += `\n*${idx + 1}. ${escapeMarkdown(r.title)}*\n`;
      text += `   🏷️ ${typeLabel} | 📥 Downloads: ${r.download_count}\n`;

      if (r.telegram_file_id) {
        keyboard.text(`📥 Send File #${idx + 1}`, `res_send_${r.id}`);
      } else if (r.file_url && r.file_url.startsWith('http')) {
        keyboard.url(`🔗 Open Link #${idx + 1}`, r.file_url);
      }
      if ((idx + 1) % 2 === 0) keyboard.row();
    });

    keyboard.row().text('🏠 Main Menu', 'menu_main');

    await ctx.reply(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: keyboard
    });
    return;
  }

  // 2. Not in database: Automatically log request for executives!
  const created = await conversation.external(() =>
    createRequest({
      userId: dbUser.id,
      courseCode: queryText.toUpperCase().slice(0, 50),
      topicTitle: queryText,
      details: `Requested by ${ctx.from.first_name || 'Student'} via quick finder`
    })
  );

  await ctx.reply(
    `⏳ *Material Not Found Yet*\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `We don't have files for *"${escapeMarkdown(queryText)}"* uploaded yet.\n\n` +
    `✅ *Request Auto-Logged (ID: #${created.id})*\n` +
    `The GASS Academic Committee has been alerted. As soon as an executive uploads it, you will receive it right here in this chat!\n\n` +
    `_Statistics for Development_`,
    {
      parse_mode: 'Markdown',
      reply_markup: new InlineKeyboard()
        .text('🔍 Search Another Topic', 'menu_search')
        .text('🏠 Main Menu', 'menu_main')
    }
  );
}

module.exports = {
  requestResourceConversation
};
