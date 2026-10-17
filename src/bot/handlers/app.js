const { config } = require('../../config');
const { InlineKeyboard } = require('grammy');

async function handleAppInfo(ctx) {
  const { getBrandConfig } = require('../../services/settingsService');
  const brand = await getBrandConfig();

  const text = 
`📲 *${brand.name} — Official Student App*
━━━━━━━━━━━━━━━━━━
${brand.fullName} mobile application.

Features include:
• Academic resources across all levels
• Past questions, lecture notes, and slides
• Departmental updates and notices

Download directly from the Google Play Store below:`;

  const keyboard = new InlineKeyboard()
    .url('📲 Download on Google Play', brand.links.playStore)
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

module.exports = {
  handleAppInfo
};
