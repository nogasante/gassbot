const { getLevelsKeyboard, getSemestersKeyboard, getCoursesKeyboard, getCourseActionKeyboard } = require('../keyboards/academic');
const { getCoursesByLevelAndSemester, getCourseById, getTopicsByCourseId } = require('../../services/courseService');
const { getResourcesByCourse } = require('../../services/resourceService');
const { InlineKeyboard } = require('grammy');

async function handleAcademicMenu(ctx) {
  const text = 
`📚 *Academic Resource Portal*
━━━━━━━━━━━━━━━━━━
Select your academic year to browse courses, lecture slides, past questions, and lab manuals:`;

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: getLevelsKeyboard()
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: getLevelsKeyboard()
    });
  }
}

async function handleLevelSelect(ctx, level) {
  const text = 
`📚 *Level ${level} Statistics Curriculum*
━━━━━━━━━━━━━━━━━━
Please select the semester:`;

  await ctx.editMessageText(text, {
    parse_mode: 'Markdown',
    reply_markup: getSemestersKeyboard(level)
  });
}

async function handleSemesterSelect(ctx, level, semester) {
  const courses = await getCoursesByLevelAndSemester(level, semester);

  if (courses.length === 0) {
    await ctx.editMessageText(
      `⚠️ *No courses found for Level ${level} Semester ${semester}.*\nPlease check back shortly.`,
      {
        parse_mode: 'Markdown',
        reply_markup: getSemestersKeyboard(level)
      }
    );
    return;
  }

  const text = 
`📖 *Level ${level} - Semester ${semester} Courses*
━━━━━━━━━━━━━━━━━━
Select a course to view syllabus, lecture slides, and past questions:`;

  await ctx.editMessageText(text, {
    parse_mode: 'Markdown',
    reply_markup: getCoursesKeyboard(courses, level, semester)
  });
}

async function handleCourseSelect(ctx, courseId) {
  const course = await getCourseById(courseId);
  if (!course) {
    await ctx.reply('⚠️ Course not found.');
    return;
  }

  const topics = await getTopicsByCourseId(courseId);
  let topicSummary = '';
  if (topics.length > 0) {
    topicSummary = `\n\n📌 *Core Topics:*\n` + topics.map(t => `• ${t.title}`).join('\n');
  }

  const text = 
`📘 *${course.code}: ${course.title}*
━━━━━━━━━━━━━━━━━━
🏛️ *Level:* ${course.level} | *Semester:* ${course.semester}
📝 *Overview:* ${course.description || 'No description provided.'}${topicSummary}

Select an action below:`;

  await ctx.editMessageText(text, {
    parse_mode: 'Markdown',
    reply_markup: getCourseActionKeyboard(course.id, course.level, course.semester)
  });
}

async function handleResourceList(ctx, courseId, resourceType = null) {
  const course = await getCourseById(courseId);
  if (!course) {
    await ctx.reply('⚠️ Course not found.');
    return;
  }

  const resources = await getResourcesByCourse(courseId, resourceType);

  if (resources.length === 0) {
    const text = 
`📂 *Resources for ${course.code}*
━━━━━━━━━━━━━━━━━━
No ${resourceType ? resourceType.replace('_', ' ') : 'course'} resources are currently uploaded for this course.

💡 _Need this material? Use the "Request Resource" button to notify the Academic Committee!_`;

    const keyboard = new InlineKeyboard()
      .text('📝 Request this Resource', 'menu_request')
      .row()
      .text('🔙 Back to Course', `acad_crs_${courseId}`)
      .text('🏠 Main Menu', 'menu_main');

    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
    return;
  }

  let text = 
`📂 *Resources for ${course.code}: ${course.title}*
━━━━━━━━━━━━━━━━━━\n`;

  const keyboard = new InlineKeyboard();

  resources.forEach((r, idx) => {
    const typeLabel = r.resource_type.toUpperCase().replace('_', ' ');
    text += `\n*${idx + 1}. ${r.title}*\n`;
    text += `   🏷️ _Type:_ ${typeLabel} | 💾 _Format:_ ${r.file_format.toUpperCase()}\n`;
    text += `   📥 _Downloads:_ ${r.download_count}\n`;
    if (r.file_url) {
      text += `   🔗 [Direct Download Link](${r.file_url})\n`;
      keyboard.url(`📥 Download #${idx + 1}`, r.file_url);
      if ((idx + 1) % 2 === 0) keyboard.row();
    }
  });

  keyboard.row();
  keyboard
    .text('🔙 Back to Course', `acad_crs_${courseId}`)
    .text('🏠 Main Menu', 'menu_main');

  await ctx.editMessageText(text, {
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    reply_markup: keyboard
  });
}

module.exports = {
  handleAcademicMenu,
  handleLevelSelect,
  handleSemesterSelect,
  handleCourseSelect,
  handleResourceList
};
