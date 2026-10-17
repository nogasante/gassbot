const { InlineKeyboard } = require('grammy');

function getLevelsKeyboard(levels = [100, 200, 300, 400]) {
  const keyboard = new InlineKeyboard();
  const list = levels && levels.length > 0 ? levels : [100, 200, 300, 400];
  const levelNames = {
    100: 'Level 100 (First Year)',
    200: 'Level 200 (Second Year)',
    300: 'Level 300 (Third Year)',
    400: 'Level 400 (Final Year)'
  };
  list.forEach(lvl => {
    const label = levelNames[lvl] || `Level ${lvl}`;
    keyboard.text(label, `acad_lvl_${lvl}`).row();
  });
  keyboard.text('🔙 Back to Main Menu', 'menu_main');
  return keyboard;
}

function getSemestersKeyboard(level) {
  return new InlineKeyboard()
    .text('📅 Semester 1', `acad_sem_${level}_1`)
    .text('📅 Semester 2', `acad_sem_${level}_2`)
    .row()
    .text('🔙 Back to Levels', 'menu_academic')
    .text('🏠 Main Menu', 'menu_main');
}

function getCoursesKeyboard(courses, level, semester) {
  const keyboard = new InlineKeyboard();
  courses.forEach((course) => {
    keyboard.text(`${course.code}: ${course.title.slice(0, 28)}`, `acad_crs_${course.id}`).row();
  });
  keyboard
    .text(`🔙 Back to Semesters`, `acad_lvl_${level}`)
    .text('🏠 Main Menu', 'menu_main');
  return keyboard;
}

function getCourseActionKeyboard(courseId, level, semester, resourceTypes = null) {
  const keyboard = new InlineKeyboard()
    .text('📂 View All Resources', `res_list_${courseId}`)
    .row();

  const types = resourceTypes && resourceTypes.length > 0 ? resourceTypes : [
    { key: 'past_question', label: '📝 Past Questions' },
    { key: 'lecture_slide', label: '📊 Lecture Slides' },
    { key: 'syllabus', label: '📑 Course Outline' },
    { key: 'note', label: '💡 Lab Notes' }
  ];

  for (let i = 0; i < types.length; i += 2) {
    const t1 = types[i];
    const t2 = types[i + 1];
    if (t2) {
      keyboard.text(t1.label, `res_type_${courseId}_${t1.key}`)
        .text(t2.label, `res_type_${courseId}_${t2.key}`)
        .row();
    } else {
      keyboard.text(t1.label, `res_type_${courseId}_${t1.key}`).row();
    }
  }

  keyboard
    .text('🔙 Back to Courses', `acad_sem_${level}_${semester}`)
    .text('🏠 Main Menu', 'menu_main');

  return keyboard;
}

module.exports = {
  getLevelsKeyboard,
  getSemestersKeyboard,
  getCoursesKeyboard,
  getCourseActionKeyboard
};
