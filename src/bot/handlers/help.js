const { config } = require('../../config');
const { InlineKeyboard } = require('grammy');

async function handleHelp(ctx) {
  const { getBrandConfig } = require('../../services/settingsService');
  const brand = await getBrandConfig();

  const githubHost = brand.links.github ? brand.links.github.replace(/^https?:\/\//, '') : 'github.com';

  const text = 
`ℹ️ *About ${brand.name}*
━━━━━━━━━━━━━━━━━━
*${brand.fullName}*
🏛️ _Department of Statistics and Actuarial Science_
📢 *Official Slogan:* _"${brand.slogan}"_

📌 *Overview:*
${brand.name}Bot provides students with access to academic materials, past questions, and departmental resources.

💡 *Commands:*
• \`/start\` - Open Main Menu
• \`/courses\` - Browse Courses by Level
• \`/beyond\` - Statistical Software & Career Guides
• \`/search <keyword>\` - Search resources
• \`/request\` - Submit resource requests
• \`/notifications\` - Manage alert preferences
• \`/app\` - Get Student Android App
• \`/help\` - Show this help information
• \`/admin\` - Executive moderation panel

🤝 *Contact & Support:*
• Contact: ${brand.links.supportContact}
• GitHub: [${githubHost}](${brand.links.github})

_${brand.slogan}_`;

  const keyboard = new InlineKeyboard()
    .url('📲 Get App', brand.links.playStore)
    .row()
    .text('🏠 Main Menu', 'menu_main');

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: keyboard
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: keyboard
    });
  }
}

module.exports = {
  handleHelp
};
