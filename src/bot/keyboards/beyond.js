const { InlineKeyboard } = require('grammy');

const defaultBeyondPillars = [
  { key: 'programming_tools', label: '💻 Programming & Tools', desc: 'R, Python, SQL, Excel, and data developer tools' },
  { key: 'data_science_ml', label: '🤖 Data Science & ML', desc: 'Exploratory analysis, machine learning, and statistical modeling' },
  { key: 'careers_opportunities', label: '💼 Careers & Opportunities', desc: 'Career roadmaps, scholarships, and datathons' },
  { key: 'research_thesis', label: '📑 Research & Thesis', desc: 'Academic writing, LaTeX templates, and research methodology' }
];

function getBeyondPillarsKeyboard(pillars = defaultBeyondPillars) {
  const keyboard = new InlineKeyboard();
  const list = pillars && pillars.length > 0 ? pillars : defaultBeyondPillars;
  for (let i = 0; i < list.length; i += 2) {
    const item1 = list[i];
    const item2 = list[i + 1];
    if (item2) {
      keyboard.text(item1.label, `beyond_pillar_${item1.key}`).text(item2.label, `beyond_pillar_${item2.key}`).row();
    } else {
      keyboard.text(item1.label, `beyond_pillar_${item1.key}`).row();
    }
  }
  keyboard.text('🔙 Back to Main Menu', 'menu_main');
  return keyboard;
}

function getBeyondSubTopicsKeyboard(pillarKey, subTopics = []) {
  const keyboard = new InlineKeyboard();
  for (let i = 0; i < subTopics.length; i += 2) {
    const item1 = subTopics[i];
    const item2 = subTopics[i + 1];
    if (item2) {
      keyboard.text(item1.label, `beyond_sub_${item1.key}`).text(item2.label, `beyond_sub_${item2.key}`).row();
    } else {
      keyboard.text(item1.label, `beyond_sub_${item1.key}`).row();
    }
  }
  keyboard.row()
    .text('🔙 Back to Categories', 'menu_beyond')
    .text('🏠 Main Menu', 'menu_main');
  return keyboard;
}

function getBeyondResourcesKeyboard(pillarKey, subTopicKey, resources = []) {
  const keyboard = new InlineKeyboard();

  resources.forEach(r => {
    const icon = r.resource_type === 'past_question' ? '📑' :
                 r.resource_type === 'e_book' ? '📚' :
                 r.resource_type === 'code_repo' ? '💻' :
                 r.resource_type === 'lecture_slide' ? '📊' : '📄';
    const shortTitle = r.title.length > 36 ? `${r.title.slice(0, 33)}...` : r.title;
    keyboard.text(`${icon} ${shortTitle}`, `beyond_res_${r.id}`).row();
  });

  keyboard.text('💡 Request Material', 'menu_request').row();

  const backCallback = pillarKey ? `beyond_pillar_${pillarKey}` : 'menu_beyond';
  keyboard
    .text('🔙 Back to Topics', backCallback)
    .text('🏠 Main Menu', 'menu_main');

  return keyboard;
}

function getResourceCardKeyboard(resource, backPillar = null, backSubTopic = null) {
  const keyboard = new InlineKeyboard();

  if (resource.telegram_file_id) {
    keyboard.text('📥 Send Document', `res_send_${resource.id}`).row();
  } else if (resource.file_url) {
    keyboard.url('🔗 Open Link', resource.file_url).row();
  }

  keyboard.text('⭐ Bookmark Material', `res_bookmark_${resource.id}`).row();

  const targetSub = backSubTopic || resource.beyond_sub_topic ||
    (resource.beyond_category && !['programming_tools', 'data_science_ml', 'careers_opportunities', 'research_thesis'].includes(resource.beyond_category) ? resource.beyond_category : null);

  const backTarget = targetSub ? `beyond_sub_${targetSub}` :
                     (resource.beyond_category ? `beyond_pillar_${resource.beyond_category}` : 'menu_beyond');

  keyboard
    .text('🔙 Back to Materials', backTarget)
    .text('🏠 Main Menu', 'menu_main');

  return keyboard;
}

// Backwards compatibility alias
const getBeyondCategoriesKeyboard = getBeyondPillarsKeyboard;
const beyondCategories = defaultBeyondPillars;

module.exports = {
  beyondCategories,
  defaultBeyondPillars,
  getBeyondPillarsKeyboard,
  getBeyondCategoriesKeyboard,
  getBeyondSubTopicsKeyboard,
  getBeyondResourcesKeyboard,
  getResourceCardKeyboard
};
