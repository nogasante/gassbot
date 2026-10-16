const { InlineKeyboard } = require('grammy');

function getLevelsKeyboard() {
  return new InlineKeyboard()
    .text('Level 100 (First Year)', 'acad_lvl_100')
    .row()
    .text('Level 200 (Second Year)', 'acad_lvl_200')
    .row()
    .text('Level 300 (Third Year)', 'acad_lvl_300')
    .row()
    .text('Level 400 (Final Year)', 'acad_lvl_400')
    .row()
    .text('🔙 Back to Main Menu', 'menu_main');
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

function getCourseActionKeyboard(courseId, level, semester) {
  return new InlineKeyboard()
    .text('📂 View All Resources', `res_list_${courseId}`)
    .row()
    .text('📝 Past Questions', `res_type_${courseId}_past_question`)
    .text('📊 Lecture Slides', `res_type_${courseId}_lecture_slide`)
    .row()
    .text('📑 Course Outline', `res_type_${courseId}_syllabus`)
    .text('💡 Lab Notes', `res_type_${courseId}_note`)
    .row()
    .text('🔙 Back to Courses', `acad_sem_${level}_${semester}`)
    .text('🏠 Main Menu', 'menu_main');
}

module.exports = {
  getLevelsKeyboard,
  getSemestersKeyboard,
  getCoursesKeyboard,
  getCourseActionKeyboard
};
