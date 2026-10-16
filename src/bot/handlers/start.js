const { config } = require('../../config');
const { findOrCreateUser } = require('../../services/userService');
const { getMainMenuKeyboard } = require('../keyboards/mainMenu');

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

Hello *${user.first_name || 'Scholar'}*, welcome to your official digital academic companion. Access lecture notes, past questions, statistical software guides, departmental announcements, and study tools anytime.

✨ *What would you like to explore today?*`;

  await ctx.reply(welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: getMainMenuKeyboard(user.role === 'admin' || isAdmin)
  });
}

module.exports = {
  handleStart
};
