const {
  getBeyondPillarsKeyboard,
  getBeyondSubTopicsKeyboard,
  getBeyondResourcesKeyboard,
  getResourceCardKeyboard
} = require('../keyboards/beyond');
const { getResourcesByBeyondCategory, getResourceById } = require('../../services/resourceService');
const {
  getAllBeyondCategories,
  getBeyondCategoryByKey,
  getSubTopicsByPillar,
  getSubTopicByKey
} = require('../../services/categoryService');
const { escapeMarkdown } = require('../utils/format');
const { InlineKeyboard } = require('grammy');

async function handleBeyondMenu(ctx) {
  const text = 
`🚀 *Beyond Curriculum*
━━━━━━━━━━━━━━━━━━
Equip yourself with practical skills, data science tools, career paths, and academic research guides.

Select a category below:`;

  const pillars = await getAllBeyondCategories();

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: getBeyondPillarsKeyboard(pillars)
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: getBeyondPillarsKeyboard(pillars)
    });
  }
}

async function handleBeyondPillarSelect(ctx, pillarKey) {
  const pillar = await getBeyondCategoryByKey(pillarKey);
  const categoryLabel = pillar ? pillar.label : 'Category';
  const categoryDesc = pillar ? (pillar.desc || pillar.description || '') : '';

  const subTopics = await getSubTopicsByPillar(pillarKey);

  const text = 
`${categoryLabel}
━━━━━━━━━━━━━━━━━━
${categoryDesc ? `${categoryDesc}\n\n` : ''}Select a topic below:`;

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: getBeyondSubTopicsKeyboard(pillarKey, subTopics)
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: getBeyondSubTopicsKeyboard(pillarKey, subTopics)
    });
  }
}

async function handleBeyondSubTopicSelect(ctx, subTopicKey) {
  const subTopic = await getSubTopicByKey(subTopicKey);
  const subTopicLabel = subTopic ? subTopic.label : subTopicKey.toUpperCase();
  const subTopicDesc = subTopic ? (subTopic.desc || subTopic.description || '') : '';
  const pillarKey = subTopic ? subTopic.pillar_key : null;

  const resources = await getResourcesByBeyondCategory(null, subTopicKey);

  if (resources.length === 0) {
    const text = 
`${subTopicLabel}
━━━━━━━━━━━━━━━━━━
Curated guides for this topic are being updated by the GASS Academic & Tech team.

💡 _Have a great material to share or want to request one? Tap Request Material below!_`;

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: getBeyondResourcesKeyboard(pillarKey, subTopicKey, [])
    });
    return;
  }

  const text = 
`${subTopicLabel}
━━━━━━━━━━━━━━━━━━
${subTopicDesc ? `${subTopicDesc}\n\n` : ''}Select a material below to view:`;

  await ctx.editMessageText(text, {
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    reply_markup: getBeyondResourcesKeyboard(pillarKey, subTopicKey, resources)
  });
}

async function handleBeyondResourceView(ctx, resourceId) {
  const resource = await getResourceById(resourceId);
  if (!resource) {
    if (ctx.callbackQuery) {
      await ctx.answerCallbackQuery({ text: 'Material not found.' });
    }
    return handleBeyondMenu(ctx);
  }

  const pillar = resource.beyond_category ? await getBeyondCategoryByKey(resource.beyond_category) : null;
  const subTopic = resource.beyond_sub_topic ? await getSubTopicByKey(resource.beyond_sub_topic) : null;

  const pillarLabel = pillar ? pillar.label : 'Beyond Curriculum';
  const subTopicLabel = subTopic ? subTopic.label : (resource.beyond_sub_topic || 'General');

  const icon = resource.resource_type === 'past_question' ? '📑' :
               resource.resource_type === 'e_book' ? '📚' :
               resource.resource_type === 'code_repo' ? '💻' :
               resource.resource_type === 'lecture_slide' ? '📊' : '📄';

  let text = 
`${icon} *${escapeMarkdown(resource.title)}*
━━━━━━━━━━━━━━━━━━
• *Category:* ${escapeMarkdown(pillarLabel)}
• *Topic:* ${escapeMarkdown(subTopicLabel)}
• *Type:* \`${resource.resource_type.toUpperCase()}\`
• *Format:* \`${(resource.file_format || 'PDF').toUpperCase()}\`
• *Accesses:* ${resource.download_count}

`;

  if (resource.description) {
    text += `📝 *Overview:*\n${escapeMarkdown(resource.description)}\n\n`;
  }

  text += `Choose an action below:`;

  const keyboard = getResourceCardKeyboard(
    resource,
    resource.beyond_category,
    resource.beyond_sub_topic
  );

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

// Backwards-compatibility wrapper for any legacy callers
async function handleBeyondCategorySelect(ctx, categoryKey) {
  const pillar = await getBeyondCategoryByKey(categoryKey);
  if (pillar && ['programming_tools', 'data_science_ml', 'careers_opportunities', 'research_thesis'].includes(pillar.key)) {
    return handleBeyondPillarSelect(ctx, categoryKey);
  }
  return handleBeyondSubTopicSelect(ctx, categoryKey);
}

module.exports = {
  handleBeyondMenu,
  handleBeyondPillarSelect,
  handleBeyondSubTopicSelect,
  handleBeyondResourceView,
  handleBeyondCategorySelect
};
