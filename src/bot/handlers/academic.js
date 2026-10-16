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
    if (r.telegram_file_id) {
      keyboard.text(`📥 Send File #${idx + 1}`, `res_send_${r.id}`);
      if ((idx + 1) % 2 === 0) keyboard.row();
    } else if (r.file_url && r.file_url.startsWith('http')) {
      text += `   🔗 [Link](${r.file_url})\n`;
      keyboard.url(`📥 Open #${idx + 1}`, r.file_url);
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

async function handleSendResourceFile(ctx, resourceId) {
  const { getResourceById, incrementDownloadCount } = require('../../services/resourceService');
  const resource = await getResourceById(resourceId);
  if (!resource) {
    await ctx.answerCallbackQuery({ text: 'Resource not found.' });
    return;
  }
  await ctx.answerCallbackQuery({ text: 'Sending document...' });
  await incrementDownloadCount(resourceId);

  const caption = `📄 *${resource.title}*\n${resource.course_code ? `Course: ${resource.course_code}\n` : ''}Slogan: _"Statistics for Development"_`;

  if (resource.telegram_file_id) {
    try {
      if (resource.file_format === 'jpg' || resource.file_format === 'png') {
        await ctx.replyWithPhoto(resource.telegram_file_id, { caption, parse_mode: 'Markdown' });
      } else if (resource.file_format === 'mp4') {
        await ctx.replyWithVideo(resource.telegram_file_id, { caption, parse_mode: 'Markdown' });
      } else {
        await ctx.replyWithDocument(resource.telegram_file_id, { caption, parse_mode: 'Markdown' });
      }
    } catch (err) {
      console.error('Error sending Telegram file:', err);
      if (resource.file_url && resource.file_url.startsWith('http')) {
        await ctx.reply(`🔗 *${resource.title}*\nDownload link: ${resource.file_url}`, { parse_mode: 'Markdown' });
      } else {
        await ctx.reply('⚠️ Could not deliver this file directly. Please check back shortly.');
      }
    }
  } else if (resource.file_url) {
    await ctx.reply(`🔗 *${resource.title}*\nDownload link: ${resource.file_url}`, { parse_mode: 'Markdown' });
  }
}

module.exports = {
  handleAcademicMenu,
  handleLevelSelect,
  handleSemesterSelect,
  handleCourseSelect,
  handleResourceList,
  handleSendResourceFile
};
