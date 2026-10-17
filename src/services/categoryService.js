const { query } = require('../config/database');

const defaultBeyondCategories = [
  { key: 'programming_tools', label: '💻 Programming & Tools', desc: 'R, Python, SQL, Excel, and data developer tools', description: 'R, Python, SQL, Excel, and data developer tools', icon: '💻', order_index: 1 },
  { key: 'data_science_ml', label: '🤖 Data Science & ML', desc: 'Exploratory analysis, machine learning, and statistical modeling', description: 'Exploratory analysis, machine learning, and statistical modeling', icon: '🤖', order_index: 2 },
  { key: 'careers_opportunities', label: '💼 Careers & Opportunities', desc: 'Career roadmaps, scholarships, and datathons', description: 'Career roadmaps, scholarships, and datathons', icon: '💼', order_index: 3 },
  { key: 'research_thesis', label: '📑 Research & Thesis', desc: 'Academic writing, LaTeX templates, and research methodology', description: 'Academic writing, LaTeX templates, and research methodology', icon: '📑', order_index: 4 }
];

const defaultSubTopics = [
  { pillar_key: 'programming_tools', key: 'r', label: '📊 R Programming', desc: 'Tidyverse, ggplot2, RStudio', description: 'Tidyverse, ggplot2, RStudio', icon: '📊', order_index: 1 },
  { pillar_key: 'programming_tools', key: 'python', label: '🐍 Python for Data Science', desc: 'Pandas, NumPy, Scikit-learn', description: 'Pandas, NumPy, Scikit-learn', icon: '🐍', order_index: 2 },
  { pillar_key: 'programming_tools', key: 'sql', label: '🗄️ SQL & Databases', desc: 'Relational data and queries', description: 'Relational data and queries', icon: '🗄️', order_index: 3 },
  { pillar_key: 'programming_tools', key: 'excel', label: '📈 Excel & Power BI', desc: 'Formulas, pivot tables, dashboards', description: 'Formulas, pivot tables, dashboards', icon: '📈', order_index: 4 },

  { pillar_key: 'data_science_ml', key: 'data_analysis', label: '🔍 Exploratory Data Analysis', desc: 'Visualization & storytelling', description: 'Visualization & storytelling', icon: '🔍', order_index: 1 },
  { pillar_key: 'data_science_ml', key: 'ml', label: '🤖 Machine Learning & AI', desc: 'Supervised/unsupervised models', description: 'Supervised/unsupervised models', icon: '🤖', order_index: 2 },
  { pillar_key: 'data_science_ml', key: 'stat_modeling', label: '📈 Statistical Modeling', desc: 'Regression, time-series, and Bayesian methods', description: 'Regression, time-series, and Bayesian methods', icon: '📈', order_index: 3 },

  { pillar_key: 'careers_opportunities', key: 'careers', label: '💼 Career Roadmaps', desc: 'Data Science, Actuary, Bio-stats', description: 'Data Science, Actuary, Bio-stats', icon: '💼', order_index: 1 },
  { pillar_key: 'careers_opportunities', key: 'scholarships', label: '🎓 Scholarships & Grad School', desc: 'Global funding opportunities', description: 'Global funding opportunities', icon: '🎓', order_index: 2 },
  { pillar_key: 'careers_opportunities', key: 'competitions', label: '🏆 Datathons & Hackathons', desc: 'Kaggle, Zindi challenges', description: 'Kaggle, Zindi challenges', icon: '🏆', order_index: 3 },

  { pillar_key: 'research_thesis', key: 'research_writing', label: '📑 Research & Thesis Writing', desc: 'Methodology, references', description: 'Methodology, references', icon: '📑', order_index: 1 },
  { pillar_key: 'research_thesis', key: 'latex', label: '📝 LaTeX Publishing', desc: 'Overleaf, report templates', description: 'Overleaf, report templates', icon: '📝', order_index: 2 },
  { pillar_key: 'research_thesis', key: 'methodology', label: '🔬 Research Methodology', desc: 'Study design and research sampling', icon: '🔬', order_index: 3 }
];

async function getAllBeyondCategories({ activeOnly = true } = {}) {
  try {
    let q = `
      SELECT id, key, label, description, icon, order_index, is_active, created_at
      FROM beyond_categories
    `;
    const params = [];
    if (activeOnly) {
      q += ` WHERE is_active = TRUE`;
    }
    q += ` ORDER BY order_index ASC, id ASC;`;

    const res = await query(q, params);
    if (res.rows && res.rows.length > 0) {
      return res.rows.map(r => ({
        ...r,
        desc: r.description || '' // ensure compatibility with both .desc and .description
      }));
    }
    return defaultBeyondCategories;
  } catch (err) {
    console.warn('Error fetching beyond categories from DB, falling back to defaults:', err.message);
    return defaultBeyondCategories;
  }
}

async function getBeyondCategoryByKey(key) {
  if (!key) return null;
  const cleanKey = key.trim().toLowerCase();
  try {
    const res = await query(
      `SELECT id, key, label, description, icon, order_index, is_active, created_at
       FROM beyond_categories
       WHERE LOWER(key) = $1
       LIMIT 1;`,
      [cleanKey]
    );
    if (res.rows && res.rows.length > 0) {
      const r = res.rows[0];
      return { ...r, desc: r.description || '' };
    }

    // Fallback: check beyond_sub_topics for backwards compatibility
    const subRes = await query(
      `SELECT id, key, label, description, icon, order_index, is_active, created_at
       FROM beyond_sub_topics
       WHERE LOWER(key) = $1
       LIMIT 1;`,
      [cleanKey]
    );
    if (subRes.rows && subRes.rows.length > 0) {
      const r = subRes.rows[0];
      return { ...r, desc: r.description || '' };
    }

    const fallbackCat = defaultBeyondCategories.find(c => c.key.toLowerCase() === cleanKey);
    if (fallbackCat) return fallbackCat;

    const fallbackSub = defaultSubTopics.find(s => s.key.toLowerCase() === cleanKey);
    return fallbackSub || null;
  } catch (err) {
    console.warn('Error fetching beyond category by key from DB:', err.message);
    const fallbackCat = defaultBeyondCategories.find(c => c.key.toLowerCase() === cleanKey);
    if (fallbackCat) return fallbackCat;
    const fallbackSub = defaultSubTopics.find(s => s.key.toLowerCase() === cleanKey);
    return fallbackSub || null;
  }
}

async function createBeyondCategory({ key, label, description = '', icon = '', orderIndex = 0 }) {
  const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
  const res = await query(
    `INSERT INTO beyond_categories (key, label, description, icon, order_index, is_active)
     VALUES ($1, $2, $3, $4, $5, TRUE)
     ON CONFLICT (key) DO UPDATE
     SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, order_index = EXCLUDED.order_index, is_active = TRUE
     RETURNING id, key, label, description, icon, order_index, is_active, created_at;`,
    [cleanKey, label, description, icon, orderIndex]
  );
  const r = res.rows[0];
  return { ...r, desc: r.description || '' };
}

async function updateBeyondCategory(key, { label, description, icon, orderIndex, isActive }) {
  const cleanKey = key.trim().toLowerCase();
  const current = await getBeyondCategoryByKey(cleanKey);
  if (!current) return null;

  const newLabel = label !== undefined ? label : current.label;
  const newDesc = description !== undefined ? description : (current.description || '');
  const newIcon = icon !== undefined ? icon : (current.icon || '');
  const newOrder = orderIndex !== undefined ? orderIndex : (current.order_index || 0);
  const newActive = isActive !== undefined ? isActive : current.is_active;

  const res = await query(
    `UPDATE beyond_categories
     SET label = $1, description = $2, icon = $3, order_index = $4, is_active = $5
     WHERE LOWER(key) = $6
     RETURNING id, key, label, description, icon, order_index, is_active, created_at;`,
    [newLabel, newDesc, newIcon, newOrder, newActive, cleanKey]
  );
  if (res.rows && res.rows.length > 0) {
    const r = res.rows[0];
    return { ...r, desc: r.description || '' };
  }
  return null;
}

async function deleteBeyondCategory(key) {
  const cleanKey = key.trim().toLowerCase();
  const res = await query(
    `DELETE FROM beyond_categories
     WHERE LOWER(key) = $1
     RETURNING id, key, label;`,
    [cleanKey]
  );
  return res.rows[0] || null;
}

// Sub-topic Methods
async function getSubTopicsByPillar(pillarKey, { activeOnly = true } = {}) {
  if (!pillarKey) return [];
  const cleanKey = pillarKey.trim().toLowerCase();
  try {
    let q = `
      SELECT id, pillar_key, key, label, description, icon, order_index, is_active, created_at
      FROM beyond_sub_topics
      WHERE LOWER(pillar_key) = $1
    `;
    if (activeOnly) {
      q += ` AND is_active = TRUE`;
    }
    q += ` ORDER BY order_index ASC, id ASC;`;
    const res = await query(q, [cleanKey]);
    if (res.rows && res.rows.length > 0) {
      return res.rows.map(r => ({ ...r, desc: r.description || '' }));
    }
    return defaultSubTopics.filter(s => s.pillar_key.toLowerCase() === cleanKey);
  } catch (err) {
    console.warn('Error fetching sub-topics from DB:', err.message);
    return defaultSubTopics.filter(s => s.pillar_key.toLowerCase() === cleanKey);
  }
}

async function getSubTopicByKey(key) {
  if (!key) return null;
  const cleanKey = key.trim().toLowerCase();
  try {
    const res = await query(
      `SELECT id, pillar_key, key, label, description, icon, order_index, is_active, created_at
       FROM beyond_sub_topics
       WHERE LOWER(key) = $1
       LIMIT 1;`,
      [cleanKey]
    );
    if (res.rows && res.rows.length > 0) {
      const r = res.rows[0];
      return { ...r, desc: r.description || '' };
    }
    const fallback = defaultSubTopics.find(s => s.key.toLowerCase() === cleanKey);
    return fallback || null;
  } catch (err) {
    console.warn('Error fetching sub-topic by key from DB:', err.message);
    const fallback = defaultSubTopics.find(s => s.key.toLowerCase() === cleanKey);
    return fallback || null;
  }
}

async function getAllSubTopics({ activeOnly = true } = {}) {
  try {
    let q = `
      SELECT id, pillar_key, key, label, description, icon, order_index, is_active, created_at
      FROM beyond_sub_topics
    `;
    if (activeOnly) {
      q += ` WHERE is_active = TRUE`;
    }
    q += ` ORDER BY pillar_key ASC, order_index ASC, id ASC;`;
    const res = await query(q);
    if (res.rows && res.rows.length > 0) {
      return res.rows.map(r => ({ ...r, desc: r.description || '' }));
    }
    return defaultSubTopics;
  } catch (err) {
    console.warn('Error fetching all subtopics from DB:', err.message);
    return defaultSubTopics;
  }
}

async function createSubTopic({ pillarKey, key, label, description = '', icon = '', orderIndex = 0 }) {
  const cleanPillar = pillarKey.trim().toLowerCase();
  const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
  const res = await query(
    `INSERT INTO beyond_sub_topics (pillar_key, key, label, description, icon, order_index, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, TRUE)
     ON CONFLICT (key) DO UPDATE
     SET pillar_key = EXCLUDED.pillar_key, label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, order_index = EXCLUDED.order_index, is_active = TRUE
     RETURNING id, pillar_key, key, label, description, icon, order_index, is_active, created_at;`,
    [cleanPillar, cleanKey, label, description, icon, orderIndex]
  );
  const r = res.rows[0];
  return { ...r, desc: r.description || '' };
}

async function updateSubTopic(key, { pillarKey, label, description, icon, orderIndex, isActive }) {
  const cleanKey = key.trim().toLowerCase();
  const current = await getSubTopicByKey(cleanKey);
  if (!current) return null;

  const newPillar = pillarKey !== undefined ? pillarKey : current.pillar_key;
  const newLabel = label !== undefined ? label : current.label;
  const newDesc = description !== undefined ? description : (current.description || '');
  const newIcon = icon !== undefined ? icon : (current.icon || '');
  const newOrder = orderIndex !== undefined ? orderIndex : (current.order_index || 0);
  const newActive = isActive !== undefined ? isActive : current.is_active;

  const res = await query(
    `UPDATE beyond_sub_topics
     SET pillar_key = $1, label = $2, description = $3, icon = $4, order_index = $5, is_active = $6
     WHERE LOWER(key) = $7
     RETURNING id, pillar_key, key, label, description, icon, order_index, is_active, created_at;`,
    [newPillar, newLabel, newDesc, newIcon, newOrder, newActive, cleanKey]
  );
  if (res.rows && res.rows.length > 0) {
    const r = res.rows[0];
    return { ...r, desc: r.description || '' };
  }
  return null;
}

async function deleteSubTopic(key) {
  const cleanKey = key.trim().toLowerCase();
  const res = await query(
    `DELETE FROM beyond_sub_topics
     WHERE LOWER(key) = $1
     RETURNING id, key, label;`,
    [cleanKey]
  );
  return res.rows[0] || null;
}

module.exports = {
  getAllBeyondCategories,
  getBeyondCategoryByKey,
  createBeyondCategory,
  updateBeyondCategory,
  deleteBeyondCategory,
  defaultBeyondCategories,
  defaultSubTopics,
  getSubTopicsByPillar,
  getSubTopicByKey,
  getAllSubTopics,
  createSubTopic,
  updateSubTopic,
  deleteSubTopic
};
