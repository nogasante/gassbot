const { InlineKeyboard } = require('grammy');

const beyondCategories = [
  { key: 'r', label: '📊 R Programming', desc: 'Tidyverse, ggplot2, RStudio' },
  { key: 'python', label: '🐍 Python for Data Science', desc: 'Pandas, NumPy, Scikit-learn' },
  { key: 'sql', label: '🗄️ SQL & Databases', desc: 'PostgreSQL, query design' },
  { key: 'excel', label: '📈 Excel & Power BI', desc: 'Formulas, pivot tables, dashboards' },
  { key: 'latex', label: '📝 LaTeX Publishing', desc: 'Overleaf, report templates' },
  { key: 'data_analysis', label: '🔍 Exploratory Data Analysis', desc: 'Visualization & storytelling' },
  { key: 'ml', label: '🤖 Machine Learning & AI', desc: 'Supervised/unsupervised models' },
  { key: 'research_writing', label: '📑 Research & Thesis Writing', desc: 'Methodology, references' },
  { key: 'careers', label: '💼 Career Roadmaps', desc: 'Data Science, Actuary, Bio-stats' },
  { key: 'scholarships', label: '🎓 Scholarships & Grad School', desc: 'Global funding opportunities' },
  { key: 'competitions', label: '🏆 Datathons & Hackathons', desc: 'Kaggle, Zindi challenges' }
];

function getBeyondCategoriesKeyboard() {
  const keyboard = new InlineKeyboard();
  for (let i = 0; i < beyondCategories.length; i += 2) {
    const item1 = beyondCategories[i];
    const item2 = beyondCategories[i + 1];
    if (item2) {
      keyboard.text(item1.label, `beyond_cat_${item1.key}`).text(item2.label, `beyond_cat_${item2.key}`).row();
    } else {
      keyboard.text(item1.label, `beyond_cat_${item1.key}`).row();
    }
  }
  keyboard.text('🔙 Back to Main Menu', 'menu_main');
  return keyboard;
}

module.exports = {
  beyondCategories,
  getBeyondCategoriesKeyboard
};
