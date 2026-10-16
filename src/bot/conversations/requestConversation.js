const { createRequest } = require('../../services/requestService');
const { findOrCreateUser } = require('../../services/userService');
const { getMainMenuKeyboard } = require('../keyboards/mainMenu');
const { escapeMarkdown } = require('../utils/format');

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
    `📝 *GASS Resource Request Portal*\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `Can't find what you need? Request specific past questions, slides, notes, or software tutorials from the GASS-KNUST Academic Committee.\n\n` +
    `👉 *Step 1/3:* Please enter the *Course Code* (e.g., \`STAT 151\`, \`MATH 251\`, or \`Beyond Curriculum / R\`):`,
    { parse_mode: 'Markdown' }
  );

  const courseMsg = await conversation.waitFor(':text');
  const courseCode = courseMsg.message.text.trim();

  if (courseCode.startsWith('/')) {
    await ctx.reply('❌ Request canceled.');
    return;
  }

  await ctx.reply(
    `👉 *Step 2/3:* What is the *Topic or Specific Resource Title*? (e.g., \`Regression Residual Analysis Notes\` or \`2023 Exam Past Questions\`):`,
    { parse_mode: 'Markdown' }
  );

  const topicMsg = await conversation.waitFor(':text');
  const topicTitle = topicMsg.message.text.trim();

  if (topicTitle.startsWith('/')) {
    await ctx.reply('❌ Request canceled.');
    return;
  }

  await ctx.reply(
    `👉 *Step 3/3:* Please describe any *additional details or requirements* (or send "None"):`,
    { parse_mode: 'Markdown' }
  );

  const detailsMsg = await conversation.waitFor(':text');
  const details = detailsMsg.message.text.trim();

  if (details.startsWith('/')) {
    await ctx.reply('❌ Request canceled.');
    return;
  }

  // Create request in database
  const created = await conversation.external(() =>
    createRequest({
      userId: dbUser.id,
      courseCode,
      topicTitle,
      details
    })
  );

  await ctx.reply(
    `✅ *Resource Request Submitted Successfully!*\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📋 *Request ID:* #${created.id}\n` +
    `📚 *Course:* ${escapeMarkdown(courseCode)}\n` +
    `📌 *Topic:* ${escapeMarkdown(topicTitle)}\n` +
    `📝 *Details:* ${escapeMarkdown(details)}\n\n` +
    `The Academic Committee will review your request. You will receive an instant notification here once approved or fulfilled!\n\n` +
    `_Statistics for Development_`,
    {
      parse_mode: 'Markdown',
      reply_markup: getMainMenuKeyboard(dbUser.role === 'admin')
    }
  );
}

module.exports = {
  requestResourceConversation
};
