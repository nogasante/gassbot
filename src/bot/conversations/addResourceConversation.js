const { InlineKeyboard } = require('grammy');
const { createResource } = require('../../services/resourceService');
const { getCoursesByLevelAndSemester, getCourseByCode } = require('../../services/courseService');
const { getUserByTelegramId } = require('../../services/userService');
const { isUserAdmin } = require('../handlers/admin');
const { escapeMarkdown } = require('../utils/format');

const BEYOND_CATEGORIES = [
  { id: 'r', label: 'R for Statistics' },
  { id: 'python', label: 'Python for Data Analysis' },
  { id: 'sql', label: 'SQL & Databases' },
  { id: 'excel', label: 'Excel & Power BI' },
  { id: 'latex', label: 'LaTeX & Document Prep' },
  { id: 'data_analysis', label: 'Data Analysis & ML' },
  { id: 'research', label: 'Research & Writing' },
  { id: 'career', label: 'Careers & Internships' },
  { id: 'scholarships', label: 'Scholarships & Grants' }
];

const RESOURCE_TYPES = [
  { id: 'past_question', label: '📑 Past Question' },
  { id: 'lecture_slide', label: '📊 Lecture Slide' },
  { id: 'note', label: '📝 Lecture Notes' },
  { id: 'syllabus', label: '📋 Course Outline/Syllabus' },
  { id: 'e_book', label: '📚 Textbook/E-Book' },
  { id: 'code_repo', label: '💻 Code / Notebook' },
  { id: 'tutorial', label: '🎬 Video / Tutorial' },
  { id: 'guide', label: '📖 Guide / Article' }
];

async function addResourceConversation(conversation, ctx) {
  const telegramId = ctx.from.id;
  const dbUser = await conversation.external(() => getUserByTelegramId(telegramId));

  if (!isUserAdmin(telegramId, dbUser)) {
    await ctx.reply('⛔ *Access Denied:* Only executives and administrators can upload resources.', {
      parse_mode: 'Markdown'
    });
    return;
  }

  await ctx.reply(
    `📂 *Upload New Resource to GASS Platform*\n━━━━━━━━━━━━━━━━━━\nChoose the resource category:\n\n1️⃣ Type *academic* for KNUST Course Materials\n2️⃣ Type *beyond* for Beyond Curriculum (Programming, Career, etc.)\n\n_(Or type /cancel to abort)_`,
    { parse_mode: 'Markdown' }
  );

  let categoryChoice = await conversation.waitFor(':text');
  let choiceText = categoryChoice.message.text.trim().toLowerCase();

  if (choiceText === '/cancel') {
    await ctx.reply('❌ Resource upload cancelled.');
    return;
  }

  let isAcademic = choiceText.includes('acad') || choiceText === '1';
  let courseId = null;
  let courseCode = null;
  let beyondCategory = null;

  if (isAcademic) {
    await ctx.reply(
      `📚 *Academic Material*\nPlease enter the *Course Code* (e.g. \`MATH 171\`, \`STAT 166\`, \`STAT 361\`):`,
      { parse_mode: 'Markdown' }
    );

    let courseMsg = await conversation.waitFor(':text');
    let inputCode = courseMsg.message.text.trim();

    if (inputCode === '/cancel') {
      await ctx.reply('❌ Resource upload cancelled.');
      return;
    }

    const matchedCourse = await conversation.external(() => getCourseByCode(inputCode));
    if (matchedCourse) {
      courseId = matchedCourse.id;
      courseCode = matchedCourse.code;
    } else {
      courseCode = inputCode.toUpperCase();
    }
  } else {
    let catList = BEYOND_CATEGORIES.map((c, i) => `${i + 1}. \`${c.id}\` — ${c.label}`).join('\n');
    await ctx.reply(
      `🚀 *Beyond Curriculum Category*\nType one of the category keys below:\n\n${catList}`,
      { parse_mode: 'Markdown' }
    );

    let beyondMsg = await conversation.waitFor(':text');
    let bCat = beyondMsg.message.text.trim().toLowerCase();

    if (bCat === '/cancel') {
      await ctx.reply('❌ Resource upload cancelled.');
      return;
    }

    const found = BEYOND_CATEGORIES.find(c => c.id === bCat || bCat.includes(c.id));
    beyondCategory = found ? found.id : bCat;
  }

  // Step 2: Resource Title
  await ctx.reply(
    `📝 *Resource Title:*\nWhat is the display title for this resource?\n_Example: \`2024 Midsem Examination with Solutions\` or \`Comprehensive Tidyverse Guide\`_`,
    { parse_mode: 'Markdown' }
  );

  let titleMsg = await conversation.waitFor(':text');
  let title = titleMsg.message.text.trim();

  if (title === '/cancel') {
    await ctx.reply('❌ Resource upload cancelled.');
    return;
  }

  // Step 3: Resource Type
  let typeList = RESOURCE_TYPES.map((t, i) => `${i + 1}. \`${t.id}\` — ${t.label}`).join('\n');
  await ctx.reply(
    `📑 *Resource Type:*\nType the resource type ID (or choose a default):\n\n${typeList}`,
    { parse_mode: 'Markdown' }
  );

  let typeMsg = await conversation.waitFor(':text');
  let typeInput = typeMsg.message.text.trim().toLowerCase();

  if (typeInput === '/cancel') {
    await ctx.reply('❌ Resource upload cancelled.');
    return;
  }

  const matchedType = RESOURCE_TYPES.find(t => t.id === typeInput || typeInput.includes(t.id));
  const resourceType = matchedType ? matchedType.id : (isAcademic ? 'lecture_slide' : 'guide');

  // Step 4: Upload File or Send Link
  await ctx.reply(
    `📎 *Attach File or Link:*\n\nYou can:\n1️⃣ **Upload the file directly here** (send a PDF, document, slide, zip, or image).\n2️⃣ Or **send a web link** (Google Drive URL, YouTube, GitHub, website).\n\n_(Send the file or URL now)_`,
    { parse_mode: 'Markdown' }
  );

  let fileMsg = await conversation.waitFor(['message:document', 'message:photo', 'message:video', 'message:text']);

  let fileUrl = '';
  let telegramFileId = null;
  let fileFormat = 'link';

  if (fileMsg.message.document) {
    const doc = fileMsg.message.document;
    telegramFileId = doc.file_id;
    fileUrl = `telegram:${doc.file_id}`;
    fileFormat = doc.file_name ? doc.file_name.split('.').pop().toLowerCase() : 'pdf';
  } else if (fileMsg.message.photo) {
    const photo = fileMsg.message.photo.pop();
    telegramFileId = photo.file_id;
    fileUrl = `telegram:${photo.file_id}`;
    fileFormat = 'jpg';
  } else if (fileMsg.message.video) {
    const video = fileMsg.message.video;
    telegramFileId = video.file_id;
    fileUrl = `telegram:${video.file_id}`;
    fileFormat = 'mp4';
  } else if (fileMsg.message.text) {
    const textUrl = fileMsg.message.text.trim();
    if (textUrl === '/cancel') {
      await ctx.reply('❌ Resource upload cancelled.');
      return;
    }
    fileUrl = textUrl;
    fileFormat = 'link';
  }

  // Step 5: Save Resource in Database
  try {
    const created = await conversation.external(() => createResource({
      title,
      description: `Uploaded by GASS Executive for ${courseCode || beyondCategory}`,
      resourceType,
      category: isAcademic ? 'curriculum' : 'beyond_curriculum',
      courseId,
      beyondCategory,
      fileUrl,
      telegramFileId,
      fileFormat,
      tags: [courseCode || beyondCategory, resourceType].filter(Boolean)
    }));

    await ctx.reply(
      `✅ *Resource Published Successfully!*\n━━━━━━━━━━━━━━━━━━\n` +
      `📌 *Title:* ${escapeMarkdown(title)}\n` +
      `🏷 *Category:* ${isAcademic ? `Academic (${escapeMarkdown(courseCode)})` : `Beyond (${escapeMarkdown(beyondCategory)})`}\n` +
      `📂 *Type:* \`${resourceType}\`\n` +
      `💾 *Format:* \`${fileFormat}\`\n\n` +
      `Students can now find and access this resource immediately through GASSBot and the web mini app!`,
      {
        parse_mode: 'Markdown',
        reply_markup: new InlineKeyboard()
          .text('➕ Upload Another Resource', 'admin_add_resource')
          .row()
          .text('🔙 Admin Panel', 'menu_admin')
      }
    );
  } catch (err) {
    console.error('Failed to create resource:', err);
    await ctx.reply('❌ Error saving resource to database. Please try again.');
  }
}

module.exports = {
  addResourceConversation
};
