const { newDb } = require('pg-mem');
const fs = require('fs');
const path = require('path');
const { setPool } = require('../../src/config/database');
const { coursesData, beyondCurriculumData } = require('../../src/database/seed');

async function setupTestDb() {
  const db = newDb();

  // Register common functions or types needed by postgres in pg-mem
  db.public.registerFunction({
    name: 'now',
    implementation: () => new Date()
  });

  const adapter = db.adapters.createPg();
  const pool = new adapter.Pool();
  setPool(pool);

  // Read schema
  const schemaPath = path.join(__dirname, '../../src/database/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Execute schema
  await pool.query(schemaSql);

  return pool;
}

async function seedTestDb(pool) {
  for (const c of coursesData) {
    const res = await pool.query(
      `INSERT INTO courses (code, title, level, semester, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, code;`,
      [c.code, c.title, c.level, c.semester, c.description]
    );

    const courseId = res.rows[0].id;

    if (c.code === 'STAT 151') {
      await pool.query(
        `INSERT INTO topics (course_id, title, description, order_index)
         VALUES 
           ($1, 'Frequency Distributions & Grouped Data', 'Histograms and polygons', 1),
           ($1, 'Measures of Central Tendency', 'Mean, median, mode', 2),
           ($1, 'Measures of Dispersion', 'Range, variance, standard deviation', 3);`,
        [courseId]
      );

      await pool.query(
        `INSERT INTO resources (title, description, resource_type, category, course_id, file_url, file_format, tags)
         VALUES 
           ('STAT 151 Course Syllabus', 'Official syllabus', 'syllabus', 'curriculum', $1, 'https://example.com/stat151.pdf', 'pdf', ARRAY['stat151']),
           ('STAT 151 Past Questions 2024', 'Exams with guide', 'past_question', 'curriculum', $1, 'https://example.com/stat151-pq.pdf', 'pdf', ARRAY['stat151', 'pq']);`,
        [courseId]
      );
    }
  }

  for (const r of beyondCurriculumData) {
    await pool.query(
      `INSERT INTO resources (title, description, resource_type, category, beyond_category, file_url, file_format, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [r.title, r.description, r.resource_type, r.category, r.beyond_category, r.file_url, r.file_format, r.tags]
    );
  }

  await pool.query(
    `INSERT INTO announcements (title, content, priority, target_level, broadcasted_at)
     VALUES ('Welcome to GASS', 'Official academic platform launch', 'academic', NULL, NOW());`
  );
}

module.exports = {
  setupTestDb,
  seedTestDb
};
