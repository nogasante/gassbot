const { config } = require('../../config');
const { InlineKeyboard } = require('grammy');

async function handleHelp(ctx) {
  const text = 
`ℹ️ *About GASS-KNUST & Help Guide*
━━━━━━━━━━━━━━━━━━
*Ghana Association of Statistics Students (GASS)*
*Kwame Nkrumah University of Science and Technology (KNUST)*
🏛️ _Department of Statistics and Actuarial Science_
📢 *Official Slogan:* _"${config.brand.slogan}"_

📌 *Platform Overview:*
GASSBot is the official digital academic platform built to empower Statistics and Actuarial Science students with direct access to accredited academic materials, past exam questions, software tutorials, and career opportunities.

💡 *Available Commands:*
• \`/start\` - Open Main Menu & Register profile
• \`/courses\` - Browse Courses by Level (100–400)
• \`/beyond\` - Statistical Software & Career Guides
• \`/search <keyword>\` - Instant resource search
• \`/request\` - Submit resource requests to executives
• \`/notifications\` - Manage alerts & year level
• \`/app\` - Access the Web App & PWA installation
• \`/help\` - Show this help information
• \`/admin\` - Executive moderation panel (Admin only)

🤝 *Need Support or Want to Contribute?*
Reach out to the GASS Academic & Tech Committee:
• Support: ${config.brand.links.supportContact}
• Web: [gass-knust.vercel.app](${config.brand.links.website})
• GitHub: [github.com/gass-knust](${config.brand.links.github})

_Statistics for Development_`;

  const keyboard = new InlineKeyboard()
    .url('🌐 Visit Website', config.brand.links.website)
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
