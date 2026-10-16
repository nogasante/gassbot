const { getBeyondCategoriesKeyboard, beyondCategories } = require('../keyboards/beyond');
const { getResourcesByBeyondCategory } = require('../../services/resourceService');
const { InlineKeyboard } = require('grammy');

async function handleBeyondMenu(ctx) {
  const text = 
`🚀 *Beyond Curriculum Hub*
━━━━━━━━━━━━━━━━━━
Equip yourself with high-demand statistical software, data science tools, industry workflows, and scholarship guides.

Choose a topic below to explore resources curated specifically for Statistics students:`;

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: getBeyondCategoriesKeyboard()
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: getBeyondCategoriesKeyboard()
    });
  }
}

async function handleBeyondCategorySelect(ctx, categoryKey) {
  const matched = beyondCategories.find(c => c.key === categoryKey);
  const categoryLabel = matched ? matched.label : categoryKey.toUpperCase();

  const resources = await getResourcesByBeyondCategory(categoryKey);

  if (resources.length === 0) {
    const text = 
`${categoryLabel}
━━━━━━━━━━━━━━━━━━
Curated guides for this category are being updated by the GASS Academic & Tech team.

💡 _Have a great resource to share? Contact an executive or use the Request portal!_`;

    const keyboard = new InlineKeyboard()
      .text('🔙 Back to Categories', 'menu_beyond')
      .text('🏠 Main Menu', 'menu_main');

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
    return;
  }

  let text = 
`${categoryLabel}
━━━━━━━━━━━━━━━━━━\n`;

  const keyboard = new InlineKeyboard();

  resources.forEach((r, idx) => {
    text += `\n*${idx + 1}. ${r.title}*\n`;
    text += `   📖 ${r.description || ''}\n`;
    text += `   🏷️ _Type:_ ${r.resource_type.toUpperCase()} | 📥 _Accesses:_ ${r.download_count}\n`;
    if (r.file_url) {
      text += `   🔗 [Access Resource](${r.file_url})\n`;
      keyboard.url(`🔗 Open #${idx + 1}`, r.file_url);
      if ((idx + 1) % 2 === 0) keyboard.row();
    }
  });

  keyboard.row();
  keyboard
    .text('🔙 Back to Categories', 'menu_beyond')
    .text('🏠 Main Menu', 'menu_main');

  await ctx.editMessageText(text, {
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    reply_markup: keyboard
  });
}

module.exports = {
  handleBeyondMenu,
  handleBeyondCategorySelect
};
