const { InlineKeyboard } = require('grammy');
const { createAnnouncement, broadcastAnnouncement } = require('../../services/announcementService');
const { getUserByTelegramId } = require('../../services/userService');
const { getAdminPanelKeyboard } = require('../keyboards/admin');

async function broadcastConversation(conversation, ctx) {
  const telegramId = ctx.from.id;
  const adminUser = await conversation.external(() => getUserByTelegramId(telegramId));
  const { getBrandConfig } = require('../../services/settingsService');
  const brand = await conversation.external(() => getBrandConfig());

  await ctx.reply(
    `📢 *Department Announcement Broadcaster*\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `Compose an announcement to be dispatched instantly to all subscribed ${brand.name} students.\n\n` +
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

  const { getDistinctLevels } = require('../../services/courseService');
  const levels = await conversation.external(() => getDistinctLevels());
  const audienceKeyboard = new InlineKeyboard()
    .text('All Students', 'bcast_aud_0')
    .row();

  for (let i = 0; i < levels.length; i += 2) {
    const l1 = levels[i];
    const l2 = levels[i + 1];
    if (l2) {
      audienceKeyboard.text(`Level ${l1}`, `bcast_aud_${l1}`).text(`Level ${l2}`, `bcast_aud_${l2}`).row();
    } else {
      audienceKeyboard.text(`Level ${l1}`, `bcast_aud_${l1}`).row();
    }
  }
  audienceKeyboard.text('❌ Cancel', 'bcast_aud_cancel');

  await ctx.reply(`👉 *Step 3/3:* Select target audience:`, {
    parse_mode: 'Markdown',
    reply_markup: audienceKeyboard
  });

  const audCtx = await conversation.waitForCallbackQuery(/^bcast_aud_(\d+|cancel)$/);
  await audCtx.answerCallbackQuery();
  const audChoice = audCtx.callbackQuery.data.replace('bcast_aud_', '');
  if (audChoice === 'cancel') {
    await ctx.reply('❌ Broadcast canceled.');
    return;
  }
  const targetLevel = audChoice === '0' ? null : parseInt(audChoice, 10);

  const previewText = 
`📢 *ANNOUNCEMENT PREVIEW*
━━━━━━━━━━━━━━━━━━
📌 *${title}*
${targetLevel ? `🎯 *Target Audience:* Level ${targetLevel}\n` : '🎯 *Target Audience:* All Students\n'}
${content}

━━━━━━━━━━━━━━━━━━
_${brand.fullName}_
_${brand.slogan}_`;

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
