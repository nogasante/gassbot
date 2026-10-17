const { query, closePool } = require('../config/database');

// Exact Official GASS-KNUST Curriculum
const coursesData = [
  // Level 100 - Semester 1
  { code: 'MATH 171', title: 'Calculus I', level: 100, semester: 1 },
  { code: 'MATH 173', title: 'Logic and Set Theory', level: 100, semester: 1 },
  { code: 'MATH 175', title: 'Vectors and Mechanics', level: 100, semester: 1 },
  { code: 'MATH 177', title: 'Computing for Mathematics I', level: 100, semester: 1 },
  { code: 'BIO 155', title: 'Biology for Mathematics', level: 100, semester: 1 },
  { code: 'ECONS 151', title: 'Elements of Economics I', level: 100, semester: 1 },
  { code: 'ENGL 157', title: 'Communication Skills I', level: 100, semester: 1 },

  // Level 100 - Semester 2
  { code: 'MATH 172', title: 'Calculus II', level: 100, semester: 2 },
  { code: 'MATH 174', title: 'Discrete Mathematics', level: 100, semester: 2 },
  { code: 'MATH 176', title: 'Linear Algebra I', level: 100, semester: 2 },
  { code: 'ENGL 178', title: 'Computing for Mathematics II', level: 100, semester: 2 },
  { code: 'STAT 166', title: 'Probability and Statistics', level: 100, semester: 2 },
  { code: 'ECONS 152', title: 'Elements of Economics II', level: 100, semester: 2 },
  { code: 'ENGL 158', title: 'Communication Skills II', level: 100, semester: 2 },

  // Level 200 - Semester 1
  { code: 'MATH 265', title: 'Mathematical Methods I', level: 200, semester: 1 },
  { code: 'STAT 266', title: 'Statistical Inference', level: 200, semester: 1 },
  { code: 'MATH 277', title: 'Real Analysis I', level: 200, semester: 1 },
  { code: 'MATH 275', title: 'Linear Algebra II', level: 200, semester: 1 },
  { code: 'MATH 279', title: 'Mathematical Programming', level: 200, semester: 1 },
  { code: 'STAT 265', title: 'Probability Distributions', level: 200, semester: 1 },
  { code: 'ENGL 263', title: 'Literature in English I', level: 200, semester: 1 },

  // Level 200 - Semester 2
  { code: 'MATH 278', title: 'Real Analysis II', level: 200, semester: 2 },
  { code: 'MATH 266', title: 'Mathematical Methods II', level: 200, semester: 2 },
  { code: 'MATH 276', title: 'Numerical Analysis I', level: 200, semester: 2 },
  { code: 'STAT 266', title: 'Statistical Inference', level: 200, semester: 2 },
  { code: 'MATH 286', title: 'Differential Equations I', level: 200, semester: 2 },
  { code: 'ENGL 264', title: 'Literature in English II', level: 200, semester: 2 },
  { code: 'STAT 267', title: 'Statistical Reasoning', level: 200, semester: 2 },

  // Level 300 - Semester 1
  { code: 'MATH 365', title: 'Differential Equations II', level: 300, semester: 1 },
  { code: 'MATH 379', title: 'Numerical Analysis II', level: 300, semester: 1 },
  { code: 'STAT 361', title: 'Statistical Computing and Data Analysis I', level: 300, semester: 1 },
  { code: 'STAT 363', title: 'Demographic Statistics', level: 300, semester: 1 },
  { code: 'STAT 365', title: 'Sample Survey Theory and Methods I', level: 300, semester: 1 },
  { code: 'STAT 367', title: 'Introduction to Regression Analysis', level: 300, semester: 1 },
  { code: 'STAT 369', title: 'Stochastic Processes I', level: 300, semester: 1 },

  // Level 300 - Semester 2
  { code: 'STAT 362', title: 'Statistical Computing and Data Analysis II', level: 300, semester: 2 },
  { code: 'MATH 366', title: 'Partial Differential Equations', level: 300, semester: 2 },
  { code: 'STAT 364', title: 'Non-Parametric Statistics', level: 300, semester: 2 },
  { code: 'STAT 366', title: 'Sample Survey Theory and Methods II', level: 300, semester: 2 },
  { code: 'STAT 368', title: 'Time Series Analysis I', level: 300, semester: 2 },
  { code: 'STAT 370', title: 'Stochastic Processes II', level: 300, semester: 2 },

  // Level 400 - Semester 1
  { code: 'STAT 461', title: 'Project Report Writing', level: 400, semester: 1 },
  { code: 'STAT 463', title: 'Introduction to Measure and Probability Theory', level: 400, semester: 1 },
  { code: 'STAT 465', title: 'Survival Analysis', level: 400, semester: 1 },
  { code: 'STAT 467', title: 'Design and Analysis of Experiments I', level: 400, semester: 1 },
  { code: 'STAT 469', title: 'Operations Research I', level: 400, semester: 1 },
  { code: 'STAT 471', title: 'Applied Time Series Analysis', level: 400, semester: 1 },
  { code: 'STAT 473', title: 'Further Topics in Regression Analysis', level: 400, semester: 1 },
  { code: 'STAT 475', title: 'Mathematics of Finance', level: 400, semester: 1 },
  { code: 'ACTS 475', title: 'Loss Models I', level: 400, semester: 1 },
  { code: 'MATH 473', title: 'Mathematical Economics I', level: 400, semester: 1 },
  { code: 'MGT 471', title: 'Principles of Management I', level: 400, semester: 1 },

  // Level 400 - Semester 2
  { code: 'STAT 462', title: 'Project Report', level: 400, semester: 2 },
  { code: 'STAT 464', title: 'Introduction to Bayesian Statistics', level: 400, semester: 2 },
  { code: 'STAT 466', title: 'Multivariate Analysis', level: 400, semester: 2 },
  { code: 'STAT 468', title: 'Design and Analysis of Experiments II', level: 400, semester: 2 },
  { code: 'STAT 470', title: 'Operations Research II', level: 400, semester: 2 },
  { code: 'STAT 472', title: 'Statistical Quality Control', level: 400, semester: 2 },
  { code: 'STAT 474', title: 'Topics in Biostatistics', level: 400, semester: 2 },
  { code: 'STAT 476', title: 'Actuarial Statistics II', level: 400, semester: 2 },
  { code: 'STAT 478', title: 'Financial Accounting', level: 400, semester: 2 },
  { code: 'MATH 474', title: 'Mathematical Economics II', level: 400, semester: 2 },
  { code: 'MGT 472', title: 'Principles of Management II', level: 400, semester: 2 }
];

const beyondCategoriesData = [
  { key: 'programming_tools', label: '💻 Programming & Tools', description: 'R, Python, SQL, Excel, and data developer tools', icon: '💻', orderIndex: 1 },
  { key: 'data_science_ml', label: '🤖 Data Science & ML', description: 'Exploratory analysis, machine learning, and statistical modeling', icon: '🤖', orderIndex: 2 },
  { key: 'careers_opportunities', label: '💼 Careers & Opportunities', description: 'Career roadmaps, scholarships, and datathons', icon: '💼', orderIndex: 3 },
  { key: 'research_thesis', label: '📑 Research & Thesis', description: 'Academic writing, LaTeX templates, and research methodology', icon: '📑', orderIndex: 4 }
];

const beyondSubTopicsData = [
  // Programming & Tools
  { pillarKey: 'programming_tools', key: 'r', label: '📊 R Programming', description: 'Tidyverse, ggplot2, RStudio', icon: '📊', orderIndex: 1 },
  { pillarKey: 'programming_tools', key: 'python', label: '🐍 Python for Data Science', description: 'Pandas, NumPy, Scikit-learn', icon: '🐍', orderIndex: 2 },
  { pillarKey: 'programming_tools', key: 'sql', label: '🗄️ SQL & Databases', description: 'Relational data and queries', icon: '🗄️', orderIndex: 3 },
  { pillarKey: 'programming_tools', key: 'excel', label: '📈 Excel & Power BI', description: 'Formulas, pivot tables, dashboards', icon: '📈', orderIndex: 4 },

  // Data Science & ML
  { pillarKey: 'data_science_ml', key: 'data_analysis', label: '🔍 Exploratory Data Analysis', description: 'Visualization & storytelling', icon: '🔍', orderIndex: 1 },
  { pillarKey: 'data_science_ml', key: 'ml', label: '🤖 Machine Learning & AI', description: 'Supervised/unsupervised models', icon: '🤖', orderIndex: 2 },
  { pillarKey: 'data_science_ml', key: 'stat_modeling', label: '📈 Statistical Modeling', description: 'Regression, time-series, and Bayesian methods', icon: '📈', orderIndex: 3 },

  // Careers & Opportunities
  { pillarKey: 'careers_opportunities', key: 'careers', label: '💼 Career Roadmaps', description: 'Data Science, Actuary, Bio-stats', icon: '💼', orderIndex: 1 },
  { pillarKey: 'careers_opportunities', key: 'scholarships', label: '🎓 Scholarships & Grad School', description: 'Global funding opportunities', icon: '🎓', orderIndex: 2 },
  { pillarKey: 'careers_opportunities', key: 'competitions', label: '🏆 Datathons & Hackathons', description: 'Kaggle, Zindi challenges', icon: '🏆', orderIndex: 3 },

  // Research & Thesis
  { pillarKey: 'research_thesis', key: 'research_writing', label: '📑 Research & Thesis Writing', description: 'Methodology, references', icon: '📑', orderIndex: 1 },
  { pillarKey: 'research_thesis', key: 'latex', label: '📝 LaTeX Publishing', description: 'Overleaf, report templates', icon: '📝', orderIndex: 2 },
  { pillarKey: 'research_thesis', key: 'methodology', label: '🔬 Research Methodology', description: 'Study design and research sampling', icon: '🔬', orderIndex: 3 }
];

const resourceTypesData = [
  { key: 'past_question', label: '📑 Past Question', icon: '📑', orderIndex: 1 },
  { key: 'lecture_slide', label: '📊 Lecture Slide', icon: '📊', orderIndex: 2 },
  { key: 'note', label: '📝 Lecture Notes', icon: '📝', orderIndex: 3 },
  { key: 'syllabus', label: '📋 Syllabus', icon: '📋', orderIndex: 4 },
  { key: 'e_book', label: '📚 Textbook', icon: '📚', orderIndex: 5 },
  { key: 'code_repo', label: '💻 Code', icon: '💻', orderIndex: 6 }
];

const appSettingsData = [
  { key: 'brand_name', value: 'GASS-KNUST', description: 'Official short brand name' },
  { key: 'brand_slogan', value: 'Statistics for Development', description: 'Official association motto/slogan' },
  { key: 'brand_full_name', value: 'Ghana Association of Statistics Students - KNUST', description: 'Official association full name' },
  { key: 'play_store_url', value: 'https://play.google.com/store/apps/details?id=gasshub.android', description: 'Gassa Android Play Store URL' },
  { key: 'mini_app_url', value: 'https://gass-knust.vercel.app', description: 'GASS Web & Mini App URL' },
  { key: 'github_url', value: 'https://github.com/gass-knust', description: 'GASS GitHub Organization' },
  { key: 'website_url', value: 'https://gass-knust.vercel.app', description: 'Official GASS-KNUST Website' },
  { key: 'support_contact', value: '@gass_executives', description: 'Telegram support contact handle' }
];

async function seed() {
  console.log('Seeding official GASS-KNUST courses, categories, resource types, and settings...');
  
  // Clean out any old mock data
  await query('DELETE FROM resources WHERE category = $1', ['curriculum']);
  await query('DELETE FROM courses');

  for (const course of coursesData) {
    await query(
      `INSERT INTO courses (code, title, level, semester, description, is_active)
       VALUES ($1, $2, $3, $4, $5, TRUE)`,
      [course.code, course.title, course.level, course.semester, `${course.code} - ${course.title}`]
    );
  }

  // Seed Beyond Curriculum 4 Core Pillars
  for (const cat of beyondCategoriesData) {
    await query(
      `INSERT INTO beyond_categories (key, label, description, icon, order_index, is_active)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       ON CONFLICT (key) DO UPDATE
       SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, order_index = EXCLUDED.order_index, is_active = TRUE;`,
      [cat.key, cat.label, cat.description, cat.icon, cat.orderIndex]
    );
  }

  // Seed Beyond Curriculum Sub-Topics
  for (const sub of beyondSubTopicsData) {
    await query(
      `INSERT INTO beyond_sub_topics (pillar_key, key, label, description, icon, order_index, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       ON CONFLICT (key) DO UPDATE
       SET pillar_key = EXCLUDED.pillar_key, label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, order_index = EXCLUDED.order_index, is_active = TRUE;`,
      [sub.pillarKey, sub.key, sub.label, sub.description, sub.icon, sub.orderIndex]
    );
  }

  // Clean out obsolete standalone categories from beyond_categories (only 4 pillars remain at category level)
  await query(
    `DELETE FROM beyond_categories WHERE key NOT IN ('programming_tools', 'data_science_ml', 'careers_opportunities', 'research_thesis');`
  );

  // Migrate existing resources beyond_category and beyond_sub_topic
  const pillarMapping = {
    r: 'programming_tools',
    python: 'programming_tools',
    sql: 'programming_tools',
    excel: 'programming_tools',
    data_analysis: 'data_science_ml',
    ml: 'data_science_ml',
    stat_modeling: 'data_science_ml',
    careers: 'careers_opportunities',
    scholarships: 'careers_opportunities',
    competitions: 'careers_opportunities',
    research_writing: 'research_thesis',
    latex: 'research_thesis',
    methodology: 'research_thesis'
  };

  for (const [subKey, pillarKey] of Object.entries(pillarMapping)) {
    await query(
      `UPDATE resources
       SET beyond_category = $1, beyond_sub_topic = $2
       WHERE (LOWER(beyond_category) = $2 OR LOWER(beyond_sub_topic) = $2);`,
      [pillarKey, subKey]
    );
  }

  // Seed Resource Types
  for (const type of resourceTypesData) {
    await query(
      `INSERT INTO resource_types (key, label, icon, order_index, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT (key) DO UPDATE
       SET label = EXCLUDED.label, icon = EXCLUDED.icon, order_index = EXCLUDED.order_index;`,
      [type.key, type.label, type.icon, type.orderIndex]
    );
  }

  // Seed App Settings
  for (const s of appSettingsData) {
    await query(
      `INSERT INTO app_settings (key, value, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, description = EXCLUDED.description, updated_at = NOW();`,
      [s.key, s.value, s.description]
    );
  }

  console.log(`Seeded ${coursesData.length} courses, ${beyondCategoriesData.length} categories, ${resourceTypesData.length} resource types, and settings successfully!`);
}

if (require.main === module) {
  seed()
    .then(async () => {
      console.log('Done.');
      await closePool();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Seed failed:', err);
      await closePool();
      process.exit(1);
    });
}

module.exports = {
  seed,
  coursesData,
  beyondCategoriesData,
  beyondSubTopicsData,
  resourceTypesData,
  appSettingsData
};
