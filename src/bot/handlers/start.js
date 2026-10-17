const { config } = require('../../config');
const { findOrCreateUser } = require('../../services/userService');
const { getMainMenuKeyboard, getPersistentMenuKeyboard } = require('../keyboards/mainMenu');

async function handleStart(ctx) {
  const telegramUser = ctx.from;
  const isAdmin = config.adminTelegramIds.includes(telegramUser.id);
  const role = isAdmin ? 'admin' : 'student';

  const user = await findOrCreateUser({
    telegramId: telegramUser.id,
    username: telegramUser.username || null,
    firstName: telegramUser.first_name || '',
    lastName: telegramUser.last_name || '',
    role
  });

  const { getBrandConfig } = require('../../services/settingsService');
  const brand = await getBrandConfig();

  const welcomeMessage = 
`🇬🇭 *Welcome to ${brand.name}!*
━━━━━━━━━━━━━━━━━━
*${brand.fullName}*
_"${brand.slogan}"_

Hello *${user.first_name || 'Student'}*! Tap an option below to browse academic courses, explore software and career materials, or search for resources.`;

  await ctx.reply(welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: getPersistentMenuKeyboard(user.role === 'admin' || isAdmin)
  });
}

module.exports = {
  handleStart
};
