const { newDb } = require('pg-mem');
const fs = require('fs');
const path = require('path');
const { setPool } = require('../../src/config/database');
const { coursesData, beyondCategoriesData, beyondSubTopicsData, resourceTypesData, appSettingsData } = require('../../src/database/seed');

const testBeyondResources = [
  {
    title: 'R for Data Science Guide',
    description: 'Tidyverse and R statistical workflow',
    resource_type: 'guide',
    category: 'beyond_curriculum',
    beyond_category: 'programming_tools',
    beyond_sub_topic: 'r',
    file_url: 'https://r4ds.hadley.nz/',
    file_format: 'link',
    tags: ['r', 'statistics']
  },
  {
    title: 'Python for Statistics',
    description: 'Pandas and scipy for data analysis',
    resource_type: 'tutorial',
    category: 'beyond_curriculum',
    beyond_category: 'programming_tools',
    beyond_sub_topic: 'python',
    file_url: 'https://example.com/python-stats',
    file_format: 'link',
    tags: ['python', 'statistics']
  }
];

async function setupTestDb() {
  const db = newDb();

  db.public.registerFunction({
    name: 'now',
    implementation: () => new Date()
  });

  const adapter = db.adapters.createPg();
  const pool = new adapter.Pool();
  setPool(pool);

  const schemaPath = path.join(__dirname, '../../src/database/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  await pool.query(schemaSql);
  return pool;
}

async function seedTestDb(pool) {
  for (const c of coursesData) {
    const res = await pool.query(
      `INSERT INTO courses (code, title, level, semester, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, code;`,
      [c.code, c.title, c.level, c.semester, `${c.code} - ${c.title}`]
    );

    const courseId = res.rows[0].id;

    if (c.code === 'MATH 171') {
      await pool.query(
        `INSERT INTO topics (course_id, title, description, order_index)
         VALUES 
           ($1, 'Limits & Continuity', 'Introduction to limits', 1),
           ($1, 'Differentiation', 'Rules and applications', 2);`,
        [courseId]
      );

      await pool.query(
        `INSERT INTO resources (title, description, resource_type, category, course_id, file_url, file_format, tags)
         VALUES 
           ('MATH 171 Course Outline', 'Official course syllabus', 'syllabus', 'curriculum', $1, 'https://example.com/math171.pdf', 'pdf', ARRAY['math171']),
           ('MATH 171 Past Questions', 'Past exam questions', 'past_question', 'curriculum', $1, 'https://example.com/math171-pq.pdf', 'pdf', ARRAY['math171', 'pq']);`,
        [courseId]
      );
    }
  }

  for (const r of testBeyondResources) {
    await pool.query(
      `INSERT INTO resources (title, description, resource_type, category, beyond_category, beyond_sub_topic, file_url, file_format, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [r.title, r.description, r.resource_type, r.category, r.beyond_category, r.beyond_sub_topic, r.file_url, r.file_format, r.tags]
    );
  }

  await pool.query(
    `INSERT INTO announcements (title, content, priority, target_level, broadcasted_at)
     VALUES ('Welcome to GASS', 'Official academic platform launch', 'normal', NULL, NOW());`
  );

  for (const cat of beyondCategoriesData) {
    await pool.query(
      `INSERT INTO beyond_categories (key, label, description, icon, order_index, is_active)
       VALUES ($1, $2, $3, $4, $5, TRUE);`,
      [cat.key, cat.label, cat.description, cat.icon, cat.orderIndex]
    );
  }

  if (beyondSubTopicsData) {
    for (const sub of beyondSubTopicsData) {
      await pool.query(
        `INSERT INTO beyond_sub_topics (pillar_key, key, label, description, icon, order_index, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE);`,
        [sub.pillarKey, sub.key, sub.label, sub.description, sub.icon, sub.orderIndex]
      );
    }
  }

  for (const type of resourceTypesData) {
    await pool.query(
      `INSERT INTO resource_types (key, label, icon, order_index, is_active)
       VALUES ($1, $2, $3, $4, TRUE);`,
      [type.key, type.label, type.icon, type.orderIndex]
    );
  }

  for (const s of appSettingsData) {
    await pool.query(
      `INSERT INTO app_settings (key, value, description)
       VALUES ($1, $2, $3);`,
      [s.key, s.value, s.description]
    );
  }
}

module.exports = {
  setupTestDb,
  seedTestDb
};
