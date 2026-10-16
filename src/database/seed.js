const { query } = require('../config/database');

const coursesData = [
  // Level 100 Semester 1
  { code: 'MATH 151', title: 'Calculus I', level: 100, semester: 1, description: 'Limits, continuity, differentiation, applications of derivatives, integration basics.' },
  { code: 'STAT 151', title: 'Introduction to Statistics I', level: 100, semester: 1, description: 'Nature and scope of statistics, frequency distributions, measures of central tendency and dispersion.' },
  { code: 'MATH 153', title: 'Algebra and Trigonometry', level: 100, semester: 1, description: 'Set theory, real and complex numbers, matrices, sequences and series, trigonometric functions.' },
  { code: 'CS 157', title: 'Introduction to Computing', level: 100, semester: 1, description: 'Computer hardware, software fundamentals, algorithm design, flowcharts, introduction to scripting.' },

  // Level 100 Semester 2
  { code: 'MATH 152', title: 'Calculus II', level: 100, semester: 2, description: 'Techniques of integration, definite integrals, differential equations, sequences and series.' },
  { code: 'STAT 152', title: 'Introduction to Statistics II', level: 100, semester: 2, description: 'Basic probability concepts, random variables, binomial, Poisson, and normal distributions.' },
  { code: 'STAT 154', title: 'Probability I', level: 100, semester: 2, description: 'Sample spaces, events, axiomatic probability, conditional probability, Bayes theorem, independent events.' },
  { code: 'CS 158', title: 'Programming with C and Python', level: 100, semester: 2, description: 'Structured programming principles, control structures, functions, data structures in Python and C.' },

  // Level 200 Semester 1
  { code: 'STAT 251', title: 'Probability Theory II', level: 200, semester: 1, description: 'Joint probability distributions, marginal and conditional distributions, expectation, covariance, correlation.' },
  { code: 'STAT 253', title: 'Statistical Computing with R', level: 200, semester: 1, description: 'R syntax, data wrangling, tidyverse, data visualization with ggplot2, statistical simulations.' },
  { code: 'STAT 255', title: 'Applied Regression Analysis', level: 200, semester: 1, description: 'Simple linear regression, multiple regression, diagnostics, residual analysis, multicollinearity, model selection.' },
  { code: 'MATH 251', title: 'Linear Algebra', level: 200, semester: 1, description: 'Vector spaces, subspaces, linear transformations, eigenvalues and eigenvectors, matrix diagonalisation.' },

  // Level 200 Semester 2
  { code: 'STAT 252', title: 'Mathematical Statistics I', level: 200, semester: 2, description: 'Point estimation, unbiasedness, consistency, maximum likelihood estimation, method of moments.' },
  { code: 'STAT 254', title: 'Sample Survey Theory & Methods', level: 200, semester: 2, description: 'Simple random sampling, stratified sampling, cluster sampling, systematic sampling, ratio estimators.' },
  { code: 'STAT 256', title: 'Experimental Design I', level: 200, semester: 2, description: 'Completely Randomized Design (CRD), Randomized Complete Block Design (RCBD), Latin Square Design, ANOVA.' },
  { code: 'MATH 252', title: 'Advanced Calculus', level: 200, semester: 2, description: 'Functions of several variables, partial derivatives, multiple integrals, Green and Stokes theorems.' },

  // Level 300 Semester 1
  { code: 'STAT 351', title: 'Mathematical Statistics II', level: 300, semester: 1, description: 'Hypothesis testing, Neyman-Pearson lemma, likelihood ratio tests, confidence intervals, sufficiency and completeness.' },
  { code: 'STAT 353', title: 'Stochastic Processes', level: 300, semester: 1, description: 'Markov chains, transition probabilities, Poisson processes, birth-and-death processes, queueing theory.' },
  { code: 'STAT 355', title: 'Multivariate Methods', level: 300, semester: 1, description: 'Multivariate normal distribution, Principal Component Analysis (PCA), Factor Analysis, Discriminant Analysis.' },
  { code: 'STAT 357', title: 'Time Series Analysis I', level: 300, semester: 1, description: 'Stationarity, autocorrelation function (ACF), PACF, AR, MA, ARMA, ARIMA modeling, forecasting.' },

  // Level 300 Semester 2
  { code: 'STAT 352', title: 'Biostatistics & Epidemiology', level: 300, semester: 2, description: 'Odds ratios, relative risks, survival analysis, Kaplan-Meier estimator, Cox proportional hazards, clinical trials.' },
  { code: 'STAT 354', title: 'Quality Control & Reliability', level: 300, semester: 2, description: 'Statistical process control, Shewhart control charts, acceptance sampling, reliability functions, hazard rates.' },
  { code: 'STAT 356', title: 'Statistical Machine Learning', level: 300, semester: 2, description: 'Supervised and unsupervised learning, decision trees, random forests, SVM, k-means clustering, model validation.' },
  { code: 'STAT 358', title: 'Non-parametric Methods', level: 300, semester: 2, description: 'Sign test, Wilcoxon signed-rank test, Mann-Whitney U test, Kruskal-Wallis test, rank correlation.' },

  // Level 400 Semester 1
  { code: 'STAT 451', title: 'Econometrics', level: 400, semester: 1, description: 'Simultaneous equations, instrumental variables, panel data models, heteroscedasticity and autocorrelation.' },
  { code: 'STAT 453', title: 'Advanced Time Series', level: 400, semester: 1, description: 'Volatility modeling, ARCH and GARCH models, vector autoregression (VAR), cointegration, error correction.' },
  { code: 'STAT 455', title: 'Actuarial Statistics', level: 400, semester: 1, description: 'Life tables, survival models, premium calculation, insurance reserves, risk theory, credibility models.' },
  { code: 'STAT 457', title: 'Research Methods & Data Analysis', level: 400, semester: 1, description: 'Research design, questionnaire construction, ethical issues in data science, academic paper writing.' },

  // Level 400 Semester 2
  { code: 'STAT 452', title: 'Bayesian Inference', level: 400, semester: 2, description: 'Prior and posterior distributions, conjugate priors, MCMC algorithms, Gibbs sampling, hierarchical models.' },
  { code: 'STAT 454', title: 'Spatial Data Analysis', level: 400, semester: 2, description: 'Spatial autocorrelation, Moran I, variogram modeling, kriging, point pattern analysis, GIS integration.' },
  { code: 'STAT 456', title: 'Big Data Analytics', level: 400, semester: 2, description: 'Distributed computing, Apache Spark, MapReduce, handling large datasets, cloud data architectures.' },
  { code: 'STAT 499', title: 'Final Year Project', level: 400, semester: 2, description: 'Independent research project, thesis write-up, data collection and analysis under faculty supervision.' }
];

const beyondCurriculumData = [
  {
    title: 'R for Data Science Master Guide',
    description: 'Comprehensive guide covering Tidyverse, dplyr, and ggplot2 for modern statistical workflows.',
    resource_type: 'guide',
    category: 'beyond_curriculum',
    beyond_category: 'r',
    file_url: 'https://r4ds.hadley.nz/',
    file_format: 'link',
    tags: ['r', 'tidyverse', 'data_science', 'visualization']
  },
  {
    title: 'Applied R Script Templates for KNUST Statistics',
    description: 'Curated repository of R scripts for probability simulations, regression tests, and ANOVA.',
    resource_type: 'code_repo',
    category: 'beyond_curriculum',
    beyond_category: 'r',
    file_url: 'https://github.com/gass-knust/r-statistical-computing',
    file_format: 'link',
    tags: ['r', 'simulation', 'code']
  },
  {
    title: 'Python for Data Analysis & Statistical Modeling',
    description: 'Hands-on Jupyter notebooks covering pandas, numpy, scipy.stats, and statsmodels.',
    resource_type: 'tutorial',
    category: 'beyond_curriculum',
    beyond_category: 'python',
    file_url: 'https://wesmckinney.com/book/',
    file_format: 'link',
    tags: ['python', 'pandas', 'numpy', 'statsmodels']
  },
  {
    title: 'SQL for Data Analysts & Statisticians',
    description: 'Master relational queries, window functions, aggregations, and subqueries with PostgreSQL.',
    resource_type: 'guide',
    category: 'beyond_curriculum',
    beyond_category: 'sql',
    file_url: 'https://mode.com/sql-tutorial/',
    file_format: 'link',
    tags: ['sql', 'postgres', 'database', 'queries']
  },
  {
    title: 'Excel & Power BI for Statistical Reporting',
    description: 'Advanced Excel formulas, dynamic pivot tables, power query, and interactive dashboard design in Power BI.',
    resource_type: 'tutorial',
    category: 'beyond_curriculum',
    beyond_category: 'excel',
    file_url: 'https://learn.microsoft.com/en-us/power-bi/',
    file_format: 'link',
    tags: ['excel', 'power_bi', 'dashboard', 'analytics']
  },
  {
    title: 'LaTeX Academic Thesis & Report Template for GASS',
    description: 'Ready-to-use Overleaf LaTeX template formatted for KNUST department project reports and papers.',
    resource_type: 'code_repo',
    category: 'beyond_curriculum',
    beyond_category: 'latex',
    file_url: 'https://www.overleaf.com/latex/templates',
    file_format: 'link',
    tags: ['latex', 'thesis', 'overleaf', 'reporting']
  },
  {
    title: 'Exploratory Data Analysis & Visual Storytelling',
    description: 'Techniques for uncovering patterns, handling outliers, and communicating statistical findings visually.',
    resource_type: 'guide',
    category: 'beyond_curriculum',
    beyond_category: 'data_analysis',
    file_url: 'https://www.storytellingwithdata.com/',
    file_format: 'link',
    tags: ['eda', 'visualization', 'storytelling']
  },
  {
    title: 'Machine Learning from Scratch with Python',
    description: 'Mathematics and implementation of linear models, trees, neural nets, and evaluation metrics.',
    resource_type: 'tutorial',
    category: 'beyond_curriculum',
    beyond_category: 'ml',
    file_url: 'https://developers.google.com/machine-learning/crash-course',
    file_format: 'link',
    tags: ['machine_learning', 'ai', 'algorithms']
  },
  {
    title: 'Academic Research Writing & Publication Handbook',
    description: 'Step-by-step guide on literature reviews, methodology design, APA citation, and journal submission.',
    resource_type: 'e_book',
    category: 'beyond_curriculum',
    beyond_category: 'research_writing',
    file_url: 'https://writing.wisc.edu/handbook/',
    file_format: 'link',
    tags: ['research', 'writing', 'publication', 'citation']
  },
  {
    title: 'Career Roadmap for Statistics Graduates (2026 Edition)',
    description: 'Career pathways in Data Science, Actuarial Science, Biostatistics, Quantitative Finance, and tech roles.',
    resource_type: 'guide',
    category: 'beyond_curriculum',
    beyond_category: 'careers',
    file_url: 'https://www.amstat.org/your-career',
    file_format: 'link',
    tags: ['careers', 'jobs', 'actuarial', 'data_science']
  },
  {
    title: 'Global Master & PhD Scholarships Guide for Statisticians',
    description: 'Curated list of international scholarships (Chevening, Erasmus Mundus, DAAD, Commonwealth, Mastercard).',
    resource_type: 'guide',
    category: 'beyond_curriculum',
    beyond_category: 'scholarships',
    file_url: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/',
    file_format: 'link',
    tags: ['scholarships', 'masters', 'phd', 'funding']
  },
  {
    title: 'Data Science Competitions & Hackathon Playbook',
    description: 'How to participate and win in Kaggle, Zindi Africa, and university datathons with team strategies.',
    resource_type: 'guide',
    category: 'beyond_curriculum',
    beyond_category: 'competitions',
    file_url: 'https://zindi.africa/competitions',
    file_format: 'link',
    tags: ['competitions', 'zindi', 'kaggle', 'hackathons']
  }
];

async function seedDatabase() {
  console.log('Seeding courses...');
  for (const c of coursesData) {
    const res = await query(
      `INSERT INTO courses (code, title, level, semester, description)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (code) DO UPDATE
       SET title = EXCLUDED.title,
           level = EXCLUDED.level,
           semester = EXCLUDED.semester,
           description = EXCLUDED.description
       RETURNING id, code;`,
      [c.code, c.title, c.level, c.semester, c.description]
    );

    const courseId = res.rows[0].id;

    // Add essential topics for core courses
    if (c.code === 'STAT 151') {
      await query(
        `INSERT INTO topics (course_id, title, description, order_index)
         VALUES 
           ($1, 'Frequency Distributions & Grouped Data', 'Histograms, polygons, and ogives', 1),
           ($1, 'Measures of Central Tendency', 'Mean, median, mode, harmonic and geometric means', 2),
           ($1, 'Measures of Dispersion', 'Range, variance, standard deviation, interquartile range', 3)
         ON CONFLICT DO NOTHING;`,
        [courseId]
      );

      // Add sample resources
      await query(
        `INSERT INTO resources (title, description, resource_type, category, course_id, file_url, file_format, tags)
         VALUES 
           ('STAT 151 Course Syllabus & Lecture Outline', 'Official course breakdown and grading policy', 'syllabus', 'curriculum', $1, 'https://gass-knust.vercel.app/resources/stat151-syllabus.pdf', 'pdf', ARRAY['stat151', 'syllabus']),
           ('STAT 151 End of Semester Past Questions (2020-2024)', 'Past exam questions with marked guide', 'past_question', 'curriculum', $1, 'https://gass-knust.vercel.app/resources/stat151-past-questions.pdf', 'pdf', ARRAY['stat151', 'past_questions', 'exams'])
         ON CONFLICT DO NOTHING;`,
        [courseId]
      );
    }

    if (c.code === 'STAT 253') {
      await query(
        `INSERT INTO topics (course_id, title, description, order_index)
         VALUES 
           ($1, 'Introduction to R & RStudio', 'Vectors, matrices, data frames, and factors', 1),
           ($1, 'Data Transformation with dplyr', 'Filter, select, mutate, summarize, and arrange', 2),
           ($1, 'Data Visualization with ggplot2', 'Aesthetics, geoms, facets, and custom themes', 3)
         ON CONFLICT DO NOTHING;`,
        [courseId]
      );

      await query(
        `INSERT INTO resources (title, description, resource_type, category, course_id, file_url, file_format, tags)
         VALUES 
           ('STAT 253 Lab Manual: Data Wrangling with R', 'Hands-on practical exercises for R lab sessions', 'note', 'curriculum', $1, 'https://gass-knust.vercel.app/resources/stat253-lab-manual.pdf', 'pdf', ARRAY['r', 'stat253', 'lab'])
         ON CONFLICT DO NOTHING;`,
        [courseId]
      );
    }

    if (c.code === 'STAT 255') {
      await query(
        `INSERT INTO topics (course_id, title, description, order_index)
         VALUES 
           ($1, 'Simple Linear Regression Modeling', 'Least squares estimation, hypothesis tests for beta', 1),
           ($1, 'Multiple Linear Regression & Matrix Formulation', 'Normal equations, coefficient of determination', 2),
           ($1, 'Model Diagnostics & Multicollinearity', 'Residual plots, VIF, Cook distance', 3)
         ON CONFLICT DO NOTHING;`,
        [courseId]
      );

      await query(
        `INSERT INTO resources (title, description, resource_type, category, course_id, file_url, file_format, tags)
         VALUES 
           ('STAT 255 Lecture Slides: Regression Theory & Practice', 'Comprehensive slides on regression inference', 'lecture_slide', 'curriculum', $1, 'https://gass-knust.vercel.app/resources/stat255-slides.pdf', 'pdf', ARRAY['stat255', 'regression', 'slides'])
         ON CONFLICT DO NOTHING;`,
        [courseId]
      );
    }
  }

  console.log('Seeding beyond curriculum resources...');
  for (const r of beyondCurriculumData) {
    await query(
      `INSERT INTO resources (title, description, resource_type, category, beyond_category, file_url, file_format, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT DO NOTHING;`,
      [r.title, r.description, r.resource_type, r.category, r.beyond_category, r.file_url, r.file_format, r.tags]
    );
  }

  // Seed sample initial announcement
  await query(
    `INSERT INTO announcements (title, content, priority, target_level, broadcasted_at)
     VALUES 
       ('Welcome to the New Academic Semester!', 'Welcome all Statistics students to another exciting semester! Access all course slides, past questions, and tech resources right here on GASSBot. Statistics for Development!', 'academic', NULL, NOW())
     ON CONFLICT DO NOTHING;`
  );

  console.log('Seeding completed successfully.');
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Database seeded.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

module.exports = {
  coursesData,
  beyondCurriculumData,
  seedDatabase
};
