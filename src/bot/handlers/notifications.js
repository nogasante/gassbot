const { getUserByTelegramId, toggleNotifications, updateAcademicLevel } = require('../../services/userService');
const { getDistinctLevels } = require('../../services/courseService');
const { InlineKeyboard } = require('grammy');

async function handleNotificationsMenu(ctx) {
  const telegramId = ctx.from.id;
  const user = await getUserByTelegramId(telegramId);

  const statusEmoji = user && user.notifications_enabled ? '🔔 *Active*' : '🔕 *Muted*';
  const levelText = user && user.academic_level ? `Level ${user.academic_level}` : 'Not Set (Receiving All Levels)';

  const text = 
`🔔 *Notification Preferences*
━━━━━━━━━━━━━━━━━━
Stay informed about new course past questions, lecture slides, departmental announcements, and study workshops.

• *Status:* ${statusEmoji}
• *Target Level:* *${levelText}*

Choose an option below to update your preferences:`;

  const keyboard = new InlineKeyboard();

  if (user && user.notifications_enabled) {
    keyboard.text('🔕 Turn Off Notifications', 'notif_toggle_off');
  } else {
    keyboard.text('🔔 Turn On Notifications', 'notif_toggle_on');
  }
  keyboard.row();

  const levels = await getDistinctLevels();
  const list = levels && levels.length > 0 ? levels : [100, 200, 300, 400];
  for (let i = 0; i < list.length; i += 2) {
    const l1 = list[i];
    const l2 = list[i + 1];
    if (l2) {
      keyboard.text(`🎯 Set Level ${l1}`, `notif_set_${l1}`).text(`🎯 Set Level ${l2}`, `notif_set_${l2}`).row();
    } else {
      keyboard.text(`🎯 Set Level ${l1}`, `notif_set_${l1}`).row();
    }
  }

  keyboard
    .text('🎯 All Levels (Reset)', 'notif_set_all')
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

async function handleNotificationToggle(ctx, enabled) {
  const telegramId = ctx.from.id;
  await toggleNotifications(telegramId, enabled);
  await ctx.answerCallbackQuery({
    text: enabled ? 'Notifications enabled!' : 'Notifications muted.'
  });
  await handleNotificationsMenu(ctx);
}

async function handleAcademicLevelPreference(ctx, level) {
  const telegramId = ctx.from.id;
  await updateAcademicLevel(telegramId, level);
  await ctx.answerCallbackQuery({
    text: level ? `Academic level set to Level ${level}!` : 'Academic level set to All Levels!'
  });
  await handleNotificationsMenu(ctx);
}

module.exports = {
  handleNotificationsMenu,
  handleNotificationToggle,
  handleAcademicLevelPreference
};
