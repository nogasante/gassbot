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

async function seed() {
  console.log('Seeding official GASS-KNUST courses...');
  
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

  console.log(`Seeded ${coursesData.length} official courses successfully across Levels 100-400!`);
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
  coursesData
};
