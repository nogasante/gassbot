const { config } = require('../../config');
const { getUserByTelegramId } = require('../../services/userService');
const { getPendingRequests, getRequestById, updateRequestStatus } = require('../../services/requestService');
const { getPlatformStats } = require('../../services/statsService');
const { getAdminPanelKeyboard, getRequestModerationKeyboard } = require('../keyboards/admin');
const { escapeMarkdown } = require('../utils/format');
const { InlineKeyboard } = require('grammy');

function isUserAdmin(telegramId, dbUser) {
  if (config.adminTelegramIds.includes(telegramId)) {
    return true;
  }
  return Boolean(dbUser && (dbUser.role === 'admin' || dbUser.role === 'executive'));
}

async function handleAdminMenu(ctx) {
  const telegramId = ctx.from.id;
  const dbUser = await getUserByTelegramId(telegramId);

  if (!isUserAdmin(telegramId, dbUser)) {
    await ctx.reply('⛔ *Access Denied:* You do not have administrator or executive privileges in GASSBot.', {
      parse_mode: 'Markdown'
    });
    return;
  }

  const stats = await getPlatformStats();

  const text = 
`⚡ *GASS Executive & Admin Moderation Panel*
━━━━━━━━━━━━━━━━━━
Welcome, *${dbUser ? dbUser.first_name : 'Admin'}*.

📊 *System Quick Overview:*
• 👥 Registered Students: *${stats.totalStudents}*
• 📚 Active Courses: *${stats.totalCourses}*
• 📂 Approved Resources: *${stats.totalResources}*
• 📥 Total Downloads: *${stats.totalDownloads}*
• ⏳ Pending Requests: *${stats.pendingRequests}*

Select an administrative task:`;

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: getAdminPanelKeyboard()
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: getAdminPanelKeyboard()
    });
  }
}

async function handleListPendingRequests(ctx) {
  const telegramId = ctx.from.id;
  const dbUser = await getUserByTelegramId(telegramId);
  if (!isUserAdmin(telegramId, dbUser)) {
    if (ctx.callbackQuery) {
      await ctx.answerCallbackQuery({ text: 'Access denied.' });
    } else {
      await ctx.reply('⛔ Access denied.');
    }
    return;
  }

  const requests = await getPendingRequests({ limit: 20 });

  if (requests.length === 0) {
    const text = 
`📥 *Resource Requests Queue*
━━━━━━━━━━━━━━━━━━
✅ *Zero pending requests!* All student requests have been reviewed.`;

    const keyboard = new InlineKeyboard()
      .text('🔙 Back to Admin Panel', 'menu_admin')
      .text('🏠 Main Menu', 'menu_main');

    if (ctx.callbackQuery) {
      await ctx.editMessageText(text, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } else {
      await ctx.reply(text, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    }
    return;
  }

  let text = 
`📥 *Pending Resource Requests Queue (${requests.length})*
━━━━━━━━━━━━━━━━━━
Select a request to inspect details and take moderation action:`;

  const keyboard = new InlineKeyboard();
  requests.forEach((r, idx) => {
    const student = r.first_name || r.username || 'Student';
    const course = r.course_code || 'General';
    keyboard.text(`#${r.id}: [${course}] ${student.slice(0, 15)}`, `admin_req_view_${r.id}_${idx}`).row();
  });

  keyboard
    .text('🔙 Back to Admin Panel', 'menu_admin')
    .text('🏠 Main Menu', 'menu_main');

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }
}

async function handleViewRequest(ctx, requestId, currentIndex = 0) {
  const telegramId = ctx.from.id;
  const dbUser = await getUserByTelegramId(telegramId);
  if (!isUserAdmin(telegramId, dbUser)) {
    if (ctx.callbackQuery) await ctx.answerCallbackQuery({ text: 'Access denied.' });
    return;
  }

  const req = await getRequestById(requestId);
  if (!req) {
    if (ctx.callbackQuery) await ctx.answerCallbackQuery({ text: 'Request not found.' });
    return handleListPendingRequests(ctx);
  }

  const requests = await getPendingRequests({ limit: 20 });
  const totalCount = requests.length;
  const prevId = currentIndex > 0 && requests[currentIndex - 1] ? requests[currentIndex - 1].id : null;
  const nextId = currentIndex < totalCount - 1 && requests[currentIndex + 1] ? requests[currentIndex + 1].id : null;

  const studentName = escapeMarkdown(req.first_name || req.username || 'Student');
  const levelText = req.academic_level ? `Level ${req.academic_level}` : 'Level Unspecified';

  const text = 
`📥 *Request Details (#${req.id})* [${currentIndex + 1}/${totalCount || 1}]
━━━━━━━━━━━━━━━━━━
📋 *Request ID:* #${req.id}
👤 *Student:* ${studentName} (${levelText})
📚 *Course:* ${escapeMarkdown(req.course_code || 'N/A')}
📌 *Topic / Title:* ${escapeMarkdown(req.topic_title || 'N/A')}
📝 *Details:* ${escapeMarkdown(req.details)}
📅 *Submitted:* ${new Date(req.created_at).toLocaleDateString()}
📊 *Status:* ${req.status.toUpperCase()}

Choose moderation action below:`;

  const keyboard = getRequestModerationKeyboard(req.id, currentIndex, totalCount, prevId, nextId);

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }
}

async function handleModerateRequest(ctx, requestId, action) {
  const telegramId = ctx.from.id;
  const dbUser = await getUserByTelegramId(telegramId);
  if (!isUserAdmin(telegramId, dbUser)) {
    await ctx.answerCallbackQuery({ text: 'Access denied.' });
    return;
  }

  const targetRequest = await getRequestById(requestId);
  if (!targetRequest) {
    await ctx.answerCallbackQuery({ text: 'Request not found.' });
    return;
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  const adminNotes = action === 'approve' 
    ? 'Approved by GASS Academic Committee. Resource will be uploaded shortly.' 
    : 'Reviewed by GASS Academic Committee. Unable to fulfill at this moment.';

  await updateRequestStatus(requestId, {
    status: newStatus,
    adminNotes,
    resolvedByUserId: dbUser ? dbUser.id : null
  });

  await ctx.answerCallbackQuery({
    text: `Request #${requestId} ${newStatus}!`
  });

  // Real-time dispatch notification to the student via Telegram
  if (targetRequest.telegram_id && ctx.api) {
    const statusEmoji = action === 'approve' ? '🎉' : 'ℹ️';
    const notificationText = 
`${statusEmoji} *Update on Your GASS Resource Request*
━━━━━━━━━━━━━━━━━━
Hello *${escapeMarkdown(targetRequest.first_name || 'Scholar')}*,

Your request for *${escapeMarkdown(targetRequest.course_code || 'Course')}* (*${escapeMarkdown(targetRequest.topic_title || 'Topic')}*) has been *${newStatus.toUpperCase()}* by the GASS Academic Committee.

📝 *Committee Note:* ${escapeMarkdown(adminNotes)}

Thank you for your active participation in GASS-KNUST!
_Statistics for Development_`;

    try {
      await ctx.api.sendMessage(targetRequest.telegram_id, notificationText, {
        parse_mode: 'Markdown'
      });
    } catch (err) {
      console.warn(`Could not send Telegram update to student ${targetRequest.telegram_id}:`, err.message);
    }
  }

  // Refresh queue
  await handleListPendingRequests(ctx);
}

async function handleAdminStats(ctx) {
  const stats = await getPlatformStats();
  const text = 
`📊 *GASS Platform Analytics & Metrics*
━━━━━━━━━━━━━━━━━━
👥 *Students Registered:* ${stats.totalStudents}
📚 *Total Courses:* ${stats.totalCourses}
📂 *Curriculum & Beyond Resources:* ${stats.totalResources}
📥 *Resource Accesses / Downloads:* ${stats.totalDownloads}
⏳ *Pending Student Requests:* ${stats.pendingRequests}
📢 *Broadcasted Announcements:* ${stats.totalAnnouncements}

━━━━━━━━━━━━━━━━━━
_Ghana Association of Statistics Students_
_Statistics for Development_`;

  const keyboard = new InlineKeyboard()
    .text('🔙 Back to Admin Panel', 'menu_admin')
    .text('🏠 Main Menu', 'menu_main');

  await ctx.editMessageText(text, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

module.exports = {
  isUserAdmin,
  handleAdminMenu,
  handleListPendingRequests,
  handleViewRequest,
  handleModerateRequest,
  handleAdminStats
};
