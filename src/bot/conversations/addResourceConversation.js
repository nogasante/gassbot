const { InlineKeyboard } = require('grammy');
const { createResource } = require('../../services/resourceService');
const { getCoursesByLevelAndSemester, getDistinctLevels } = require('../../services/courseService');
const { getAllBeyondCategories, getSubTopicsByPillar } = require('../../services/categoryService');
const { getAllResourceTypes } = require('../../services/resourceTypeService');
const { getUserByTelegramId } = require('../../services/userService');
const { isUserAdmin } = require('../handlers/admin');
const { escapeMarkdown } = require('../utils/format');

async function addResourceConversation(conversation, ctx) {
  const telegramId = ctx.from.id;
  const dbUser = await conversation.external(() => getUserByTelegramId(telegramId));

  if (!isUserAdmin(telegramId, dbUser)) {
    await ctx.reply('⛔ *Access Denied:* Only executives and administrators can upload resources.', {
      parse_mode: 'Markdown'
    });
    return;
  }

  const initialData = ctx.callbackQuery?.data || '';
  const crsMatch = initialData.match(/^admin_crs_add_res_(\d+)$/);
  const bydMatch = initialData.match(/^admin_byd_add_res_([a-z0-9_-]+)$/);
  const reqMatch = initialData.match(/^admin_req_approve_(\d+)$/);

  let courseId = null;
  let courseCode = null;
  let beyondCategory = null;
  let beyondSubTopic = null;
  let beyondSubTopicLabel = '';
  let isAcademic = true;
  let activeCtx = ctx;
  let fulfillingRequestId = null;
  let targetRequest = null;

  if (crsMatch) {
    const targetCrsId = parseInt(crsMatch[1], 10);
    const { getCourseById } = require('../../services/courseService');
    const course = await conversation.external(() => getCourseById(targetCrsId));
    if (course) {
      courseId = course.id;
      courseCode = course.code;
      isAcademic = true;
    }
  } else if (bydMatch) {
    const targetSubKey = bydMatch[1];
    const { getSubTopicByKey } = require('../../services/categoryService');
    const subTopic = await conversation.external(() => getSubTopicByKey(targetSubKey));
    if (subTopic) {
      beyondSubTopic = subTopic.key;
      beyondCategory = subTopic.pillar_key;
      beyondSubTopicLabel = subTopic.label;
      isAcademic = false;
    }
  } else if (reqMatch) {
    fulfillingRequestId = parseInt(reqMatch[1], 10);
    const { getRequestById } = require('../../services/requestService');
    targetRequest = await conversation.external(() => getRequestById(fulfillingRequestId));
    if (targetRequest) {
      const { getCourseByCode } = require('../../services/courseService');
      const { getAllBeyondSubTopics } = require('../../services/categoryService');

      let course = null;
      if (targetRequest.course_code) {
        course = await conversation.external(() => getCourseByCode(targetRequest.course_code));
      }
      if (course) {
        courseId = course.id;
        courseCode = course.code;
        isAcademic = true;
      } else {
        const subTopics = await conversation.external(() => getAllBeyondSubTopics());
        const matchedSub = subTopics.find(s => 
          (targetRequest.course_code && s.key.toLowerCase() === targetRequest.course_code.toLowerCase()) ||
          (targetRequest.topic_title && s.key.toLowerCase() === targetRequest.topic_title.toLowerCase()) ||
          (targetRequest.topic_title && s.label.toLowerCase().includes(targetRequest.topic_title.toLowerCase()))
        );
        if (matchedSub) {
          beyondSubTopic = matchedSub.key;
          beyondCategory = matchedSub.pillar_key;
          beyondSubTopicLabel = matchedSub.label;
          isAcademic = false;
        }
      }
    }
  }

  if (!courseId && !beyondSubTopic) {
    // STEP 1: Category Selection (Buttons)
    const catKeyboard = new InlineKeyboard()
      .text('📚 KNUST Course Material', 'up_cat_acad')
      .row()
      .text('🚀 Beyond Curriculum', 'up_cat_beyond')
      .row()
      .text('❌ Cancel', 'up_cancel');

    await ctx.reply(
      `📂 *Upload Resource to GASS Platform*\n━━━━━━━━━━━━━━━━━━\nSelect the resource category below:`,
      {
        parse_mode: 'Markdown',
        reply_markup: catKeyboard
      }
    );

    const catCtx = await conversation.waitFor('callback_query:data');
    await catCtx.answerCallbackQuery();
    const catChoice = catCtx.callbackQuery.data;

    if (catChoice === 'up_cancel') {
      await catCtx.editMessageText('❌ Upload cancelled.');
      return;
    }

    isAcademic = catChoice === 'up_cat_acad';

  if (isAcademic) {
    // STEP 2A: Pick Level (Buttons from DB)
    const levels = await conversation.external(() => getDistinctLevels());
    const levelKeyboard = new InlineKeyboard();
    for (let i = 0; i < levels.length; i += 2) {
      const l1 = levels[i];
      const l2 = levels[i + 1];
      if (l2) {
        levelKeyboard.text(`Level ${l1}`, `up_lvl_${l1}`).text(`Level ${l2}`, `up_lvl_${l2}`).row();
      } else {
        levelKeyboard.text(`Level ${l1}`, `up_lvl_${l1}`).row();
      }
    }
    levelKeyboard.text('❌ Cancel', 'up_cancel');

    await catCtx.editMessageText(
      `📚 *Select Academic Level:*`,
      { parse_mode: 'Markdown', reply_markup: levelKeyboard }
    );

    const lvlCtx = await conversation.waitFor('callback_query:data');
    await lvlCtx.answerCallbackQuery();
    if (lvlCtx.callbackQuery.data === 'up_cancel') {
      await lvlCtx.editMessageText('❌ Upload cancelled.');
      return;
    }
    const level = parseInt(lvlCtx.callbackQuery.data.replace('up_lvl_', ''), 10);

    // STEP 2B: Pick Semester (Buttons)
    const semKeyboard = new InlineKeyboard()
      .text('📘 Semester 1', 'up_sem_1')
      .text('📙 Semester 2', 'up_sem_2')
      .row()
      .text('❌ Cancel', 'up_cancel');

    await lvlCtx.editMessageText(
      `📚 *Level ${level}* — Select Semester:`,
      { parse_mode: 'Markdown', reply_markup: semKeyboard }
    );

    const semCtx = await conversation.waitFor('callback_query:data');
    await semCtx.answerCallbackQuery();
    if (semCtx.callbackQuery.data === 'up_cancel') {
      await semCtx.editMessageText('❌ Upload cancelled.');
      return;
    }
    const semester = parseInt(semCtx.callbackQuery.data.replace('up_sem_', ''), 10);

    // STEP 2C: Pick Course from Database (Buttons)
    const courses = await conversation.external(() => getCoursesByLevelAndSemester(level, semester));

    if (courses.length === 0) {
      await semCtx.editMessageText(`⚠️ No courses found for Level ${level} Semester ${semester}.`);
      return;
    }

    const courseKeyboard = new InlineKeyboard();
    courses.forEach((c, idx) => {
      courseKeyboard.text(`${c.code}`, `up_crs_${c.id}`);
      if ((idx + 1) % 2 === 0) courseKeyboard.row();
    });
    courseKeyboard.row().text('❌ Cancel', 'up_cancel');

    await semCtx.editMessageText(
      `📚 *Level ${level} Semester ${semester}*\nTap the course you are uploading for:`,
      { parse_mode: 'Markdown', reply_markup: courseKeyboard }
    );

    const crsCtx = await conversation.waitFor('callback_query:data');
    await crsCtx.answerCallbackQuery();
    if (crsCtx.callbackQuery.data === 'up_cancel') {
      await crsCtx.editMessageText('❌ Upload cancelled.');
      return;
    }

    courseId = parseInt(crsCtx.callbackQuery.data.replace('up_crs_', ''), 10);
    const selectedCourse = courses.find(c => c.id === courseId);
    courseCode = selectedCourse ? selectedCourse.code : 'Course';

    // Proceed with crsCtx
    activeCtx = crsCtx;
  } else {
    // Beyond Curriculum: Step 2A - Pick Pillar (4 Pillars)
    const beyondCategories = await conversation.external(() => getAllBeyondCategories());
    const beyondKeyboard = new InlineKeyboard();
    beyondCategories.forEach((b, idx) => {
      beyondKeyboard.text(b.label, `up_bcat_${b.key}`);
      if ((idx + 1) % 2 === 0) beyondKeyboard.row();
    });
    beyondKeyboard.row().text('❌ Cancel', 'up_cancel');

    await catCtx.editMessageText(
      `🚀 *Beyond Curriculum*\nSelect a category below:`,
      { parse_mode: 'Markdown', reply_markup: beyondKeyboard }
    );

    const bCtx = await conversation.waitFor('callback_query:data');
    await bCtx.answerCallbackQuery();
    if (bCtx.callbackQuery.data === 'up_cancel') {
      await bCtx.editMessageText('❌ Upload cancelled.');
      return;
    }

    beyondCategory = bCtx.callbackQuery.data.replace('up_bcat_', '');
    const selectedPillar = beyondCategories.find(c => c.key === beyondCategory);

    // Beyond Curriculum: Step 2B - Pick Topic
    const subTopics = await conversation.external(() => getSubTopicsByPillar(beyondCategory));
    const subKeyboard = new InlineKeyboard();
    subTopics.forEach((s, idx) => {
      subKeyboard.text(s.label, `up_sub_${s.key}`);
      if ((idx + 1) % 2 === 0) subKeyboard.row();
    });
    subKeyboard.row().text('❌ Cancel', 'up_cancel');

    await bCtx.editMessageText(
      `🚀 *${selectedPillar ? selectedPillar.label : 'Beyond Curriculum'}*\nSelect a topic below:`,
      { parse_mode: 'Markdown', reply_markup: subKeyboard }
    );

    const sCtx = await conversation.waitFor('callback_query:data');
    await sCtx.answerCallbackQuery();
    if (sCtx.callbackQuery.data === 'up_cancel') {
      await sCtx.editMessageText('❌ Upload cancelled.');
      return;
    }

    beyondSubTopic = sCtx.callbackQuery.data.replace('up_sub_', '');
    const selectedSub = subTopics.find(s => s.key === beyondSubTopic);
    beyondSubTopicLabel = selectedSub ? selectedSub.label : beyondSubTopic;
    activeCtx = sCtx;
  }
}

  // STEP 3: Pick Resource Type (Buttons from DB)
  const resourceTypes = await conversation.external(() => getAllResourceTypes());
  const typeKeyboard = new InlineKeyboard();
  resourceTypes.forEach((t, idx) => {
    typeKeyboard.text(t.label, `up_type_${t.key}`);
    if ((idx + 1) % 2 === 0) typeKeyboard.row();
  });
  typeKeyboard.row().text('❌ Cancel', 'up_cancel');

  const selectedName = courseCode ? courseCode : (beyondSubTopicLabel || beyondCategory);
  let promptStep3 = `📂 *Upload Material to ${selectedName}*\n━━━━━━━━━━━━━━━━━━\nSelect the *Resource Type*:`;
  if (targetRequest) {
    promptStep3 = 
`📥 *Fulfill Student Request (#${targetRequest.id})*
━━━━━━━━━━━━━━━━━━
👤 *Student:* ${escapeMarkdown(targetRequest.first_name || targetRequest.username || 'Student')}
📚 *Target:* ${selectedName}
📌 *Requested Material:* ${escapeMarkdown(targetRequest.topic_title || targetRequest.details)}

Select the *Resource Type* for this material:`;
  }

  if (activeCtx.callbackQuery) {
    try {
      await activeCtx.editMessageText(promptStep3, { parse_mode: 'Markdown', reply_markup: typeKeyboard });
    } catch (e) {
      await activeCtx.reply(promptStep3, { parse_mode: 'Markdown', reply_markup: typeKeyboard });
    }
  } else {
    await activeCtx.reply(promptStep3, { parse_mode: 'Markdown', reply_markup: typeKeyboard });
  }

  const typeCtx = await conversation.waitFor('callback_query:data');
  await typeCtx.answerCallbackQuery();
  if (typeCtx.callbackQuery.data === 'up_cancel') {
    await typeCtx.editMessageText('❌ Upload cancelled.');
    return;
  }

  const resourceType = typeCtx.callbackQuery.data.replace('up_type_', '');

  // STEP 4: Attach File or Link
  const targetLabel = courseCode || beyondSubTopicLabel || (beyondCategory ? beyondCategory.toUpperCase() : 'General');
  let step4Text = 
    `📎 *Ready to Attach Material!*\n━━━━━━━━━━━━━━━━━━\n` +
    `Target: *${targetLabel}* (${resourceType.replace('_', ' ')})\n\n` +
    `👉 **Upload the document/PDF now** (or paste an external link):\n\n` +
    `_(Or send /cancel to abort)_`;
  if (targetRequest) {
    step4Text = 
      `📎 *Upload Material to Fulfill Request (#${targetRequest.id})*\n━━━━━━━━━━━━━━━━━━\n` +
      `Target: *${targetLabel}* (${resourceType.replace('_', ' ')})\n` +
      `👤 *Student:* ${escapeMarkdown(targetRequest.first_name || targetRequest.username || 'Student')}\n` +
      `📌 *Topic:* ${escapeMarkdown(targetRequest.topic_title || targetRequest.details)}\n\n` +
      `👉 **Upload the document/PDF now** (or paste an external link):\n\n` +
      `_(Or send /cancel to abort)_`;
  }

  await typeCtx.editMessageText(step4Text, { parse_mode: 'Markdown' });

  const fileMsg = await conversation.waitFor(['message:document', 'message:photo', 'message:video', 'message:text']);

  let fileUrl = '';
  let telegramFileId = null;
  let fileFormat = 'link';
  let title = targetRequest && targetRequest.topic_title 
    ? `${targetLabel} - ${targetRequest.topic_title}`
    : `${targetLabel} ${resourceType.replace('_', ' ')}`;

  if (fileMsg.message.document) {
    const doc = fileMsg.message.document;
    telegramFileId = doc.file_id;
    fileUrl = `telegram:${doc.file_id}`;
    fileFormat = doc.file_name ? doc.file_name.split('.').pop().toLowerCase() : 'pdf';
    if (doc.file_name) {
      title = doc.file_name.replace(/\.[^/.]+$/, ''); // use document name as clean title
    }
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
      await ctx.reply('❌ Upload cancelled.');
      return;
    }
    fileUrl = textUrl;
    fileFormat = 'link';
  }

  // Save in Database
  try {
    const description = targetRequest 
      ? `Uploaded to fulfill student request #${targetRequest.id} (${targetRequest.topic_title || targetRequest.course_code || 'material'})`
      : `Uploaded by GASS Executive for ${courseCode || beyondSubTopicLabel || beyondCategory}`;

    await conversation.external(() => createResource({
      title,
      description,
      resourceType,
      category: isAcademic ? 'curriculum' : 'beyond_curriculum',
      courseId,
      beyondCategory,
      beyondSubTopic,
      fileUrl,
      telegramFileId,
      fileFormat,
      tags: [courseCode || beyondSubTopic || beyondCategory, resourceType].filter(Boolean)
    }));

    if (fulfillingRequestId && targetRequest) {
      const { updateRequestStatus } = require('../../services/requestService');
      await conversation.external(() => updateRequestStatus(fulfillingRequestId, {
        status: 'fulfilled',
        adminNotes: `Fulfilled with material: ${title}`,
        resolvedByUserId: dbUser ? dbUser.id : null
      }));

      // Deliver directly to student via Telegram!
      if (targetRequest.telegram_id) {
        await conversation.external(async () => {
          const { getBrandConfig } = require('../../services/settingsService');
          const brand = await getBrandConfig();
          const studentMsg = 
`🎉 *Your Resource Request Has Been Fulfilled!*
━━━━━━━━━━━━━━━━━━
Hello *${escapeMarkdown(targetRequest.first_name || 'Scholar')}*,

The material you requested for *${escapeMarkdown(targetRequest.course_code || courseCode || 'Course')}* has been uploaded by the ${brand.name} Academic Committee!

📄 *Material:* ${escapeMarkdown(title)}
🏷️ *Type:* \`${resourceType}\`

Thank you for your request!
_${brand.slogan}_`;

          try {
            if (telegramFileId) {
              if (fileFormat === 'jpg' || fileFormat === 'png') {
                await ctx.api.sendPhoto(targetRequest.telegram_id, telegramFileId, {
                  caption: studentMsg,
                  parse_mode: 'Markdown'
                });
              } else if (fileFormat === 'mp4') {
                await ctx.api.sendVideo(targetRequest.telegram_id, telegramFileId, {
                  caption: studentMsg,
                  parse_mode: 'Markdown'
                });
              } else {
                await ctx.api.sendDocument(targetRequest.telegram_id, telegramFileId, {
                  caption: studentMsg,
                  parse_mode: 'Markdown'
                });
              }
            } else {
              await ctx.api.sendMessage(
                targetRequest.telegram_id,
                `${studentMsg}\n\n🔗 *Access Link:* ${fileUrl}`,
                { parse_mode: 'Markdown' }
              );
            }
          } catch (sendErr) {
            console.warn(`Could not dispatch fulfilled file to student ${targetRequest.telegram_id}:`, sendErr.message);
          }
        });
      }

      await ctx.reply(
        `🎉 *Resource Uploaded & Request #${fulfillingRequestId} Fulfilled!*\n━━━━━━━━━━━━━━━━━━\n` +
        `📌 *Title:* ${escapeMarkdown(title)}\n` +
        `📚 *Target:* ${escapeMarkdown(targetLabel)}\n` +
        `👤 *Delivered to:* ${escapeMarkdown(targetRequest.first_name || targetRequest.username || 'Student')}\n\n` +
        `The material has been published to GASSBot and delivered directly to the student!`,
        {
          parse_mode: 'Markdown',
          reply_markup: new InlineKeyboard()
            .text('📥 Next Pending Request', 'admin_requests')
            .row()
            .text(courseId ? `🔙 Back to ${courseCode || 'Course'}` : '🔙 Back to Files', courseId ? `admin_crs_view_${courseId}` : 'admin_manage_courses')
            .row()
            .text('🏠 Admin Panel', 'menu_admin')
        }
      );
    } else {
      await ctx.reply(
        `🎉 *Resource Published Successfully!*\n━━━━━━━━━━━━━━━━━━\n` +
        `📌 *Title:* ${escapeMarkdown(title)}\n` +
        `🏷️ *Category:* ${isAcademic ? `Academic (${escapeMarkdown(courseCode)})` : `Beyond (${escapeMarkdown(beyondSubTopicLabel || beyondCategory)})`}\n` +
        `📑 *Type:* \`${resourceType}\`\n\n` +
        `Students can now access this material immediately in GASSBot!`,
        {
          parse_mode: 'Markdown',
          reply_markup: new InlineKeyboard()
            .text(courseId ? `🔙 Back to ${courseCode || 'Course'}` : (beyondSubTopic ? `🔙 Back to ${beyondSubTopicLabel || 'Topic'}` : '🔙 Back to Files'), courseId ? `admin_crs_view_${courseId}` : (beyondSubTopic ? `admin_res_byd_sub_${beyondSubTopic}` : 'admin_manage_courses'))
            .row()
            .text('➕ Upload Another File', 'admin_add_resource')
            .row()
            .text('🏠 Admin Panel', 'menu_admin')
        }
      );
    }
  } catch (err) {
    console.error('Failed to create resource:', err);
    await ctx.reply('❌ Could not upload material. Please try again.');
  }
}

module.exports = {
  addResourceConversation
};
