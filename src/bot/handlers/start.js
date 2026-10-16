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

  const welcomeMessage = 
`🇬🇭 *Welcome to GASSBot!*
━━━━━━━━━━━━━━━━━━
*Ghana Association of Statistics Students (KNUST)*
_"${config.brand.slogan}"_

Hello *${user.first_name || 'Scholar'}*! Tap any menu item below or type a course code (like \`MATH 171\` or \`STAT 266\`) to instantly find and get resources.`;

  await ctx.reply(welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: getPersistentMenuKeyboard(user.role === 'admin' || isAdmin)
  });
}

module.exports = {
  handleStart
};
