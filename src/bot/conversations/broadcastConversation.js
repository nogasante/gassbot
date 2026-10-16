const { InlineKeyboard } = require('grammy');
const { createAnnouncement, broadcastAnnouncement } = require('../../services/announcementService');
const { getUserByTelegramId } = require('../../services/userService');
const { getAdminPanelKeyboard } = require('../keyboards/admin');

async function broadcastConversation(conversation, ctx) {
  const telegramId = ctx.from.id;
  const adminUser = await conversation.external(() => getUserByTelegramId(telegramId));

  await ctx.reply(
    `📢 *Department Announcement Broadcaster*\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `Compose an announcement to be dispatched instantly to all subscribed GASS-KNUST students.\n\n` +
    `👉 *Step 1/3:* Please enter the *Announcement Title*:`,
    { parse_mode: 'Markdown' }
  );

  const titleMsg = await conversation.waitFor(':text');
  const title = titleMsg.message.text.trim();
  if (title.startsWith('/')) {
    await ctx.reply('❌ Broadcast canceled.');
    return;
  }

  await ctx.reply(
    `👉 *Step 2/3:* Please enter the *Announcement Content* (supports text and links):`,
    { parse_mode: 'Markdown' }
  );

  const contentMsg = await conversation.waitFor(':text');
  const content = contentMsg.message.text.trim();
  if (content.startsWith('/')) {
    await ctx.reply('❌ Broadcast canceled.');
    return;
  }

  await ctx.reply(
    `👉 *Step 3/3:* Target Audience?\n` +
    `Reply with one of the following numbers:\n` +
    `• \`0\` - All Students\n` +
    `• \`100\` - Level 100 only\n` +
    `• \`200\` - Level 200 only\n` +
    `• \`300\` - Level 300 only\n` +
    `• \`400\` - Level 400 only`,
    { parse_mode: 'Markdown' }
  );

  const targetMsg = await conversation.waitFor(':text');
  const targetInput = targetMsg.message.text.trim();
  let targetLevel = null;
  if (['100', '200', '300', '400'].includes(targetInput)) {
    targetLevel = parseInt(targetInput, 10);
  }

  const previewText = 
`📢 *ANNOUNCEMENT PREVIEW*
━━━━━━━━━━━━━━━━━━
📌 *${title}*
${targetLevel ? `🎯 *Target Audience:* Level ${targetLevel}\n` : '🎯 *Target Audience:* All Students\n'}
${content}

━━━━━━━━━━━━━━━━━━
_Ghana Association of Statistics Students_
_Statistics for Development_`;

  await ctx.reply(previewText, {
    parse_mode: 'Markdown',
    reply_markup: new InlineKeyboard()
      .text('🚀 Confirm & Broadcast Now', 'confirm_broadcast_yes')
      .text('❌ Cancel', 'confirm_broadcast_no')
  });

  const callbackCtx = await conversation.waitForCallbackQuery([
    'confirm_broadcast_yes',
    'confirm_broadcast_no'
  ]);

  await callbackCtx.answerCallbackQuery();

  if (callbackCtx.callbackQuery.data === 'confirm_broadcast_no') {
    await ctx.reply('❌ Broadcast cancelled by admin.', {
      reply_markup: getAdminPanelKeyboard()
    });
    return;
  }

  // Save announcement
  const announcement = await conversation.external(() =>
    createAnnouncement({
      authorId: adminUser ? adminUser.id : null,
      title,
      content,
      priority: 'normal',
      targetLevel
    })
  );

  await ctx.reply('⏳ Broadcasting announcement to students...');

  const result = await conversation.external(() =>
    broadcastAnnouncement(ctx.api ? { api: ctx.api } : null, announcement)
  );

  await ctx.reply(
    `✅ *Broadcast Complete!*\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📬 *Total Eligible Students:* ${result.totalRecipients}\n` +
    `✔️ *Successfully Delivered:* ${result.successCount}\n` +
    `⚠️ *Failed/Blocked:* ${result.failureCount}`,
    {
      parse_mode: 'Markdown',
      reply_markup: getAdminPanelKeyboard()
    }
  );
}

module.exports = {
  broadcastConversation
};
