const { config } = require('../../config');
const { InlineKeyboard } = require('grammy');

async function handleAppInfo(ctx) {
  const text = 
`📲 *GASS Digital Academic Portal (Web & App)*
━━━━━━━━━━━━━━━━━━
Access GASS resources on your phone, tablet, or laptop via our student web portal.

🌟 *Key Features:*
• ⚡ Fast, lightweight, mobile-first design
• 🔍 Full text search across all KNUST statistics courses
• 📥 One-click download for past questions, slides, and datasets
• 📑 Offline reading and bookmarking
• 💻 Zero heavy dependencies — pure, lightning-fast HTML/CSS/JS

📲 *How to Install on Your Phone (PWA):*
1. Tap the *Launch Web App* button below.
2. In your browser (Chrome or Safari), tap the Share / Menu icon.
3. Select *"Add to Home Screen"*.
4. GASSBot will appear on your phone screen just like a native app!

_Statistics for Development_`;

  const keyboard = new InlineKeyboard()
    .url('🌐 Launch Web App', config.miniAppUrl)
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
