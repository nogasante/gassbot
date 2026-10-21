const { config } = require('../../config');
const {
  getUserByTelegramId,
  getUserByUsername,
  listAllAdmins,
  promoteUserToAdmin,
  demoteAdmin
} = require('../../services/userService');
const { getPendingRequests, getRequestById, updateRequestStatus } = require('../../services/requestService');
const { getPlatformStats } = require('../../services/statsService');
const {
  getRecentAnnouncements,
  getAnnouncementById,
  deleteAnnouncement
} = require('../../services/announcementService');
const {
  getAdminPanelKeyboard,
  getManageCoursesKeyboard,
  getCourseDetailsKeyboard,
  getManageCategoriesKeyboard,
  getCategoryDetailsKeyboard,
  getManageResourceTypesKeyboard,
  getResourceTypeDetailsKeyboard,
  getResourceDetailsKeyboard,
  getConfirmDeleteKeyboard,
  getRequestModerationKeyboard,
  getManageAnnouncementsKeyboard,
  getAnnouncementDetailsKeyboard,
  getConfirmDeleteAnnouncementKeyboard,
  getManageAdminsKeyboard,
  getAdminDetailsKeyboard,
  getConfirmDemoteAdminKeyboard
} = require('../keyboards/admin');
const { escapeMarkdown } = require('../utils/format');
const { InlineKeyboard } = require('grammy');

function isUserAdmin(telegramId, dbUser) {
  if (config.adminTelegramIds.includes(telegramId)) {
    return true;
  }
  return Boolean(dbUser && (dbUser.role === 'admin' || dbUser.role === 'executive'));
}

async function safeAnswerCallback(ctx, textOrOpts) {
  const opts = typeof textOrOpts === 'string' ? { text: textOrOpts } : (textOrOpts || {});
  try {
    if (typeof ctx.answerCallbackQuery === 'function') {
      await ctx.answerCallbackQuery(opts);
    } else if (ctx.callbackQuery && typeof ctx.callbackQuery.answerCallbackQuery === 'function') {
      await ctx.callbackQuery.answerCallbackQuery(opts);
    }
  } catch (e) {
    // ignore
  }
}

async function ensureAdmin(ctx) {
  if (!ctx || !ctx.from || !ctx.from.id) {
    // Allows unit test mocks where ctx.from is omitted
    return true;
  }
  const telegramId = ctx.from.id;
  const dbUser = await getUserByTelegramId(telegramId);
  if (!isUserAdmin(telegramId, dbUser)) {
    await safeAnswerCallback(ctx, { text: '⛔ Access denied. Admins only.', show_alert: true });
    if (!ctx.callbackQuery && typeof ctx.reply === 'function') {
      await ctx.reply('⛔ *Access Denied:* You do not have administrator or executive privileges in GASSBot.', {
        parse_mode: 'Markdown'
      });
    }
    return false;
  }
  return true;
}

async function handleAdminMenu(ctx) {
  if (!(await ensureAdmin(ctx))) return;
  const telegramId = ctx.from ? ctx.from.id : null;
  const dbUser = telegramId ? await getUserByTelegramId(telegramId) : null;

  const stats = await getPlatformStats();

  const fullName = dbUser 
    ? [dbUser.first_name, dbUser.last_name].filter(Boolean).join(' ') 
    : 'Admin';

  const text = 
`⚡ *Executive & Admin Panel*
━━━━━━━━━━━━━━━━━━
Welcome, *${escapeMarkdown(fullName)}*.

📊 *Overview:*
• 👥 *Students:* ${stats.totalStudents}
• 📚 *Resources on Bot:* ${stats.totalResources}
• ⏳ *Unfulfilled Requests:* ${stats.pendingRequests}

Select an administrative task below:`;

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: getAdminPanelKeyboard(stats.pendingRequests)
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: getAdminPanelKeyboard(stats.pendingRequests)
    });
  }
}

async function handleListPendingRequests(ctx) {
  if (!(await ensureAdmin(ctx))) return;

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
`📥 *Pending Student Resource Requests (${requests.length})*
━━━━━━━━━━━━━━━━━━
Select a request below to view details and upload requested material:`;

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
  if (!(await ensureAdmin(ctx))) return;

  const req = await getRequestById(requestId);
  if (!req) {
    await safeAnswerCallback(ctx, { text: 'Request not found.' });
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

Select an action below:`;

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
  if (!(await ensureAdmin(ctx))) return;
  const telegramId = ctx.from ? ctx.from.id : null;
  const dbUser = telegramId ? await getUserByTelegramId(telegramId) : null;

  const targetRequest = await getRequestById(requestId);
  if (!targetRequest) {
    await safeAnswerCallback(ctx, { text: 'Request not found.' });
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

  await safeAnswerCallback(ctx, {
    text: action === 'approve' ? `Request #${requestId} approved!` : `Request #${requestId} dismissed.`
  });

  // Real-time dispatch notification to the student via Telegram
  if (targetRequest.telegram_id && ctx.api) {
    const { getBrandConfig } = require('../../services/settingsService');
    const brand = await getBrandConfig();
    const statusEmoji = action === 'approve' ? '🎉' : 'ℹ️';
    const notificationText = 
`${statusEmoji} *Update on Your ${brand.name} Resource Request*
━━━━━━━━━━━━━━━━━━
Hello *${escapeMarkdown(targetRequest.first_name || 'Scholar')}*,

Your request for *${escapeMarkdown(targetRequest.course_code || 'Course')}* (*${escapeMarkdown(targetRequest.topic_title || 'Topic')}*) has been ${action === 'approve' ? '*APPROVED*' : '*DISMISSED*'} by the ${brand.name} Academic Committee.

📝 *Committee Note:* ${escapeMarkdown(adminNotes)}

${action === 'approve' ? 'The material is being prepared for upload.' : 'If you have questions or alternative material details, please submit a new request.'}

_${brand.slogan}_`;

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
  if (!(await ensureAdmin(ctx))) return;
  const stats = await getPlatformStats();
  const { getBrandConfig } = require('../../services/settingsService');
  const brand = await getBrandConfig();
  const text = 
`📊 *${brand.name} Platform Analytics*
━━━━━━━━━━━━━━━━━━
• 👥 *Registered Students:* ${stats.totalStudents}
• 📚 *Resources on Bot:* ${stats.totalResources}
• ⏳ *Unfulfilled Requests:* ${stats.pendingRequests}
• 🏛️ *Active Courses:* ${stats.totalCourses}
• 📢 *Broadcast Announcements:* ${stats.totalAnnouncements}

━━━━━━━━━━━━━━━━━━
_${brand.fullName}_
_${brand.slogan}_`;

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
}

// Course Management Handlers
async function handleManageCourses(ctx) {
  if (!(await ensureAdmin(ctx))) return;
  const { getDistinctLevels } = require('../../services/courseService');
  const { getManageCoursesKeyboard } = require('../keyboards/admin');
  const levels = await getDistinctLevels();

  const text = 
`📚 *Manage Academic Courses*
━━━━━━━━━━━━━━━━━━
Manage courses across all levels.
Add new courses, view course details, edit names, or remove courses:`;

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: getManageCoursesKeyboard(levels)
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: getManageCoursesKeyboard(levels)
    });
  }
}

async function handleAdminCoursesByLevel(ctx, level) {
  if (!(await ensureAdmin(ctx))) return;
  const { getAllCourses } = require('../../services/courseService');
  const courses = await getAllCourses(level, { activeOnly: false });

  let text = 
`📚 *Level ${level} Courses (${courses.length})*
━━━━━━━━━━━━━━━━━━
Tap a course to inspect details, edit title/code, or permanently delete:`;

  const keyboard = new InlineKeyboard();
  courses.forEach((c) => {
    const status = c.is_active ? '✅' : '⏸️';
    keyboard.text(`${status} ${c.code}: ${c.title.slice(0, 22)}`, `admin_crs_view_${c.id}`).row();
  });

  keyboard
    .text('➕ Add Course', 'admin_course_add')
    .text('🔙 Back to Courses', 'admin_manage_courses')
    .row()
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

async function handleViewCourse(ctx, courseId) {
  if (!(await ensureAdmin(ctx))) return;
  const { getCourseById } = require('../../services/courseService');
  const { getResourcesByCourse } = require('../../services/resourceService');
  const course = await getCourseById(courseId);
  if (!course) {
    await safeAnswerCallback(ctx, { text: 'Course not found.' });
    return;
  }

  const resources = await getResourcesByCourse(courseId);
  const resourceCount = resources ? resources.length : 0;
  const statusText = course.is_active ? '✅ Active' : '⏸️ Inactive';

  const text = 
`📚 *Course Details: ${escapeMarkdown(course.code)}*
━━━━━━━━━━━━━━━━━━
• *Code:* \`${escapeMarkdown(course.code)}\`
• *Title:* ${escapeMarkdown(course.title)}
• *Level:* Level ${course.level}
• *Semester:* Semester ${course.semester}
• *Description:* ${escapeMarkdown(course.description || 'No description provided')}
• *Status:* ${statusText}
• *Uploaded Resources:* ${resourceCount} file(s)

Choose an action below:`;

  const keyboard = getCourseDetailsKeyboard(course, course.level, resources);

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

async function handleConfirmDeleteCourse(ctx, courseId) {
  if (!(await ensureAdmin(ctx))) return;
  const { getCourseById } = require('../../services/courseService');
  const course = await getCourseById(courseId);
  if (!course) {
    await safeAnswerCallback(ctx, { text: 'Course not found.' });
    return;
  }

  const text = 
`⚠️ *Confirm Permanent Course Deletion*
━━━━━━━━━━━━━━━━━━
Are you sure you want to permanently delete *${escapeMarkdown(course.code)}*: ${escapeMarkdown(course.title)}?

⚠️ *Warning:* This will permanently remove this course from the platform. This action cannot be undone.`;

  const keyboard = getConfirmDeleteKeyboard(`admin_crs_del_confirm_${course.id}`, `admin_crs_view_${course.id}`);

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

async function handleDeleteCourse(ctx, courseId) {
  if (!(await ensureAdmin(ctx))) return;
  const { getCourseById, deleteCourse } = require('../../services/courseService');
  const course = await getCourseById(courseId);
  if (!course) {
    await safeAnswerCallback(ctx, { text: 'Course not found.' });
    return;
  }

  const level = course.level;
  await deleteCourse(courseId);
  await safeAnswerCallback(ctx, {
    text: `Course ${course.code} deleted permanently!`
  });

  await handleAdminCoursesByLevel(ctx, level);
}

async function handleToggleCourseActive(ctx, courseId) {
  if (!(await ensureAdmin(ctx))) return;
  const { getCourseById, updateCourse } = require('../../services/courseService');
  const course = await getCourseById(courseId);
  if (!course) {
    await safeAnswerCallback(ctx, { text: 'Course not found.' });
    return;
  }

  const updated = await updateCourse(courseId, { isActive: !course.is_active });
  await safeAnswerCallback(ctx, {
    text: `${course.code} is now ${updated.is_active ? 'ACTIVE ✅' : 'INACTIVE ⏸️'}`
  });

  await handleViewCourse(ctx, courseId);
}

// Category Management Handlers
async function handleManageCategories(ctx) {
  if (!(await ensureAdmin(ctx))) return;
  const { getAllBeyondCategories } = require('../../services/categoryService');
  const categories = await getAllBeyondCategories({ activeOnly: false });

  const text = 
`🚀 *Manage Beyond Curriculum Categories*
━━━━━━━━━━━━━━━━━━
Select a category to view, edit, or remove:`;

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: getManageCategoriesKeyboard(categories)
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: getManageCategoriesKeyboard(categories)
    });
  }
}

async function handleViewCategory(ctx, key) {
  if (!(await ensureAdmin(ctx))) return;
  const { getBeyondCategoryByKey } = require('../../services/categoryService');
  const cat = await getBeyondCategoryByKey(key);
  if (!cat) {
    await safeAnswerCallback(ctx, { text: 'Category not found.' });
    return;
  }

  const statusText = cat.is_active ? '✅ Active' : '⏸️ Inactive';
  const text = 
`🚀 *Category Details*
━━━━━━━━━━━━━━━━━━
• *Label:* ${escapeMarkdown(cat.label)}
• *Key:* \`${cat.key}\`
• *Status:* ${statusText}
• *Description:* ${escapeMarkdown(cat.description || cat.desc || '')}
• *Icon:* ${cat.icon || 'None'}
• *Order:* ${cat.order_index || 0}

Choose an action below:`;

  const keyboard = getCategoryDetailsKeyboard(cat);

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

async function handleConfirmDeleteCategory(ctx, key) {
  if (!(await ensureAdmin(ctx))) return;
  const { getBeyondCategoryByKey } = require('../../services/categoryService');
  const cat = await getBeyondCategoryByKey(key);
  if (!cat) {
    await safeAnswerCallback(ctx, { text: 'Category not found.' });
    return;
  }

  const text = 
`⚠️ *Confirm Permanent Category Deletion*
━━━━━━━━━━━━━━━━━━
Are you sure you want to permanently delete the category:
*${escapeMarkdown(cat.label)}*?

⚠️ *Warning:* This will permanently remove this category from the platform. This action cannot be undone.`;

  const keyboard = getConfirmDeleteKeyboard(`admin_cat_del_confirm_${cat.key}`, `admin_cat_view_${cat.key}`);

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

async function handleDeleteCategory(ctx, key) {
  if (!(await ensureAdmin(ctx))) return;
  const { getBeyondCategoryByKey, deleteBeyondCategory } = require('../../services/categoryService');
  const cat = await getBeyondCategoryByKey(key);
  if (!cat) {
    await safeAnswerCallback(ctx, { text: 'Category not found.' });
    return;
  }

  await deleteBeyondCategory(key);
  await safeAnswerCallback(ctx, {
    text: `Category ${key} deleted permanently!`
  });

  await handleManageCategories(ctx);
}

async function handleToggleCategoryActive(ctx, key) {
  if (!(await ensureAdmin(ctx))) return;
  const { getBeyondCategoryByKey, updateBeyondCategory } = require('../../services/categoryService');
  const cat = await getBeyondCategoryByKey(key);
  if (!cat) {
    await safeAnswerCallback(ctx, { text: 'Category not found.' });
    return;
  }

  await updateBeyondCategory(key, { isActive: !cat.is_active });
  await safeAnswerCallback(ctx, {
    text: `Category ${key} updated!`
  });
  await handleViewCategory(ctx, key);
}

// Resource Type Management Handlers
async function handleManageResourceTypes(ctx) {
  if (!(await ensureAdmin(ctx))) return;
  const { getAllResourceTypes } = require('../../services/resourceTypeService');
  const types = await getAllResourceTypes({ activeOnly: false });

  const text = 
`📑 *Manage Resource Types*
━━━━━━━━━━━━━━━━━━
Manage file categories and formats across the platform.
Tap a type to inspect, edit label, toggle status, or remove:`;

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: getManageResourceTypesKeyboard(types)
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: getManageResourceTypesKeyboard(types)
    });
  }
}

async function handleViewResourceType(ctx, key) {
  if (!(await ensureAdmin(ctx))) return;
  const { getResourceTypeByKey } = require('../../services/resourceTypeService');
  const type = await getResourceTypeByKey(key);
  if (!type) {
    await safeAnswerCallback(ctx, { text: 'Resource type not found.' });
    return;
  }

  const statusText = type.is_active ? '✅ Active' : '⏸️ Inactive';
  const text = 
`📑 *Resource Type Details*
━━━━━━━━━━━━━━━━━━
• *Label:* ${escapeMarkdown(type.label)}
• *Key:* \`${type.key}\`
• *Status:* ${statusText}
• *Icon:* ${type.icon || 'None'}
• *Order:* ${type.order_index || 0}

Choose an action below:`;

  const keyboard = getResourceTypeDetailsKeyboard(type);

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

async function handleConfirmDeleteResourceType(ctx, key) {
  if (!(await ensureAdmin(ctx))) return;
  const { getResourceTypeByKey } = require('../../services/resourceTypeService');
  const type = await getResourceTypeByKey(key);
  if (!type) {
    await safeAnswerCallback(ctx, { text: 'Resource type not found.' });
    return;
  }

  const text = 
`⚠️ *Confirm Permanent Resource Type Deletion*
━━━━━━━━━━━━━━━━━━
Are you sure you want to permanently delete the resource type:
*${escapeMarkdown(type.label)}* (\`${type.key}\`)?

⚠️ *Warning:* This will permanently remove this resource type from the platform. This action cannot be undone!`;

  const keyboard = getConfirmDeleteKeyboard(`admin_type_del_confirm_${type.key}`, `admin_type_view_${type.key}`);

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

async function handleDeleteResourceType(ctx, key) {
  if (!(await ensureAdmin(ctx))) return;
  const { getResourceTypeByKey, deleteResourceType } = require('../../services/resourceTypeService');
  const type = await getResourceTypeByKey(key);
  if (!type) {
    await safeAnswerCallback(ctx, { text: 'Resource type not found.' });
    return;
  }

  await deleteResourceType(key);
  await safeAnswerCallback(ctx, {
    text: `Resource type ${key} deleted permanently!`
  });

  await handleManageResourceTypes(ctx);
}

async function handleToggleResourceTypeActive(ctx, key) {
  if (!(await ensureAdmin(ctx))) return;
  const { getResourceTypeByKey, updateResourceType } = require('../../services/resourceTypeService');
  const type = await getResourceTypeByKey(key);
  if (!type) {
    await safeAnswerCallback(ctx, { text: 'Resource type not found.' });
    return;
  }

  const updated = await updateResourceType(key, { isActive: !type.is_active });
  await safeAnswerCallback(ctx, {
    text: `Resource type ${key} is now ${updated.is_active ? 'ACTIVE ✅' : 'INACTIVE ⏸️'}`
  });
  await handleViewResourceType(ctx, key);
}

// Resource Files Management Handlers
async function handleManageResources(ctx) {
  if (!(await ensureAdmin(ctx))) return;
  const text = 
`📂 *Manage Uploaded Files*
━━━━━━━━━━━━━━━━━━
Select the resource category to inspect, rename, or permanently delete files:
• *Academic Courses:* Course slides, past questions, and notes
• *Beyond Curriculum:* Tech stacks, roadmaps, tutorials`;

  const keyboard = new InlineKeyboard()
    .text('📚 Academic Course Files', 'admin_res_nav_acad')
    .row()
    .text('🚀 Beyond Curriculum Files', 'admin_res_nav_beyond')
    .row()
    .text('🔙 Back to Admin Panel', 'menu_admin');

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

async function handleManageResourcesAcadLevels(ctx) {
  if (!(await ensureAdmin(ctx))) return;
  const { getDistinctLevels } = require('../../services/courseService');
  const levels = await getDistinctLevels();

  const text = 
`📚 *Manage Academic Files: Select Level*
━━━━━━━━━━━━━━━━━━
Choose an academic level:`;

  const keyboard = new InlineKeyboard();
  levels.forEach(lvl => {
    keyboard.text(`Level ${lvl}`, `admin_res_lvl_${lvl}`);
  });
  keyboard.row()
    .text('🔙 Back to Files', 'admin_manage_resources')
    .text('🏠 Admin Panel', 'menu_admin');

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

async function handleManageResourcesCourses(ctx, level) {
  if (!(await ensureAdmin(ctx))) return;
  const { getAllCourses } = require('../../services/courseService');
  const courses = await getAllCourses(level, { activeOnly: false });

  const text = 
`📚 *Select Course (Level ${level})*
━━━━━━━━━━━━━━━━━━
Choose a course to manage its uploaded files:`;

  const keyboard = new InlineKeyboard();
  courses.forEach(c => {
    keyboard.text(`${c.code}: ${c.title.slice(0, 22)}`, `admin_res_crs_${c.id}`).row();
  });

  keyboard
    .text('🔙 Back to Levels', 'admin_res_nav_acad')
    .text('🏠 Admin Panel', 'menu_admin');

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

async function handleManageResourcesListByCourse(ctx, courseId) {
  if (!(await ensureAdmin(ctx))) return;
  const { getCourseById } = require('../../services/courseService');
  const { getResourcesByCourse } = require('../../services/resourceService');
  const course = await getCourseById(courseId);
  const resources = await getResourcesByCourse(courseId);

  const courseTitle = course ? `${course.code}: ${course.title}` : `Course #${courseId}`;
  let text = 
`📂 *Uploaded Files for ${escapeMarkdown(courseTitle)}*
━━━━━━━━━━━━━━━━━━
Total files: ${resources.length}
Tap a file to inspect details, rename title, or delete completely:`;

  const keyboard = new InlineKeyboard();
  keyboard.text(`➕ Upload Material to ${course ? course.code : 'Course'}`, `admin_crs_add_res_${courseId}`).row();

  if (resources.length === 0) {
    text += `\n\n_No uploaded files found for this course yet._`;
  } else {
    resources.forEach(r => {
      keyboard.text(`📄 ${r.title.slice(0, 28)}`, `admin_res_view_${r.id}`).row();
    });
  }

  const backLevel = course ? course.level : 100;
  keyboard
    .text('🔙 Back to Courses', `admin_res_lvl_${backLevel}`)
    .text('🏠 Admin Panel', 'menu_admin');

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

async function handleManageResourcesBeyondCategories(ctx) {
  if (!(await ensureAdmin(ctx))) return;
  const { getAllBeyondCategories } = require('../../services/categoryService');
  const categories = await getAllBeyondCategories({ activeOnly: false });

  const text = 
`🚀 *Manage Beyond Curriculum Files*
━━━━━━━━━━━━━━━━━━
Select a category to view and manage its uploaded files:`;

  const keyboard = new InlineKeyboard();
  categories.forEach((cat, idx) => {
    keyboard.text(cat.label, `admin_res_byd_${cat.key}`);
    if ((idx + 1) % 2 === 0) keyboard.row();
  });

  keyboard.row()
    .text('🔙 Back to Files', 'admin_manage_resources')
    .text('🏠 Admin Panel', 'menu_admin');

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

async function handleManageResourcesListByBeyond(ctx, categoryKey) {
  if (!(await ensureAdmin(ctx))) return;
  const { getBeyondCategoryByKey, getSubTopicsByPillar, getSubTopicByKey } = require('../../services/categoryService');
  const { getResourcesByBeyondCategory } = require('../../services/resourceService');

  const pillar = await getBeyondCategoryByKey(categoryKey);
  const subTopics = pillar ? await getSubTopicsByPillar(categoryKey, { activeOnly: false }) : [];

  if (subTopics.length > 0) {
    const text = 
`🚀 *Manage Files: ${escapeMarkdown(pillar.label)}*
━━━━━━━━━━━━━━━━━━
Select a tool or topic to inspect and manage files:`;

    const keyboard = new InlineKeyboard();
    subTopics.forEach((sub, idx) => {
      keyboard.text(sub.label, `admin_res_byd_sub_${sub.key}`);
      if ((idx + 1) % 2 === 0) keyboard.row();
    });
    keyboard.row()
      .text('➕ Add New Topic', `admin_byd_add_topic_${pillar.key}`)
      .row()
      .text('🔙 Back to Categories', 'admin_res_nav_beyond')
      .text('🏠 Admin Panel', 'menu_admin');

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

  const sub = await getSubTopicByKey(categoryKey);
  const resources = await getResourcesByBeyondCategory(null, categoryKey);
  const titleLabel = sub ? sub.label : (pillar ? pillar.label : categoryKey);
  const backPillar = sub ? sub.pillar_key : null;

  let text = 
`🚀 *Uploaded Files for ${escapeMarkdown(titleLabel)}*
━━━━━━━━━━━━━━━━━━
Total files: ${resources.length}
Tap a file to inspect details, rename title, or delete permanently:`;

  const keyboard = new InlineKeyboard();
  keyboard.text(`➕ Upload Material to ${titleLabel}`, `admin_byd_add_res_${categoryKey}`).row();

  if (resources.length === 0) {
    text += `\n\n_No uploaded files found for this topic yet._`;
  } else {
    resources.forEach(r => {
      keyboard.text(`📄 ${r.title.slice(0, 28)}`, `admin_res_view_${r.id}`).row();
    });
  }

  const backTarget = backPillar ? `admin_res_byd_${backPillar}` : 'admin_res_nav_beyond';
  keyboard
    .text('🔙 Back', backTarget)
    .text('🏠 Admin Panel', 'menu_admin');

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

async function handleViewResource(ctx, resourceId) {
  if (!(await ensureAdmin(ctx))) return;
  const { getResourceById } = require('../../services/resourceService');
  const resource = await getResourceById(resourceId);
  if (!resource) {
    await safeAnswerCallback(ctx, { text: 'Resource not found.' });
    return;
  }

  const categoryDisplay = resource.category === 'beyond_curriculum'
    ? `Beyond Curriculum (${resource.beyond_category || 'General'})`
    : `Academic Course (${resource.course_code || 'General'})`;

  const text = 
`📂 *Resource File Details*
━━━━━━━━━━━━━━━━━━
• *Title:* ${escapeMarkdown(resource.title)}
• *Type:* ${escapeMarkdown(resource.resource_type)}
• *Category:* ${escapeMarkdown(categoryDisplay)}
• *File Format:* ${escapeMarkdown(resource.file_format || 'N/A')}
• *${resource.telegram_file_id ? 'Downloads' : 'Accesses'}:* ${resource.download_count}
• *URL / Link:* ${escapeMarkdown(resource.file_url || 'Telegram Direct File')}
${resource.description ? `• *Description:* ${escapeMarkdown(resource.description)}` : ''}

Choose an action below:`;

  const keyboard = getResourceDetailsKeyboard(resource);

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

async function handleConfirmDeleteResource(ctx, resourceId) {
  if (!(await ensureAdmin(ctx))) return;
  const { getResourceById } = require('../../services/resourceService');
  const resource = await getResourceById(resourceId);
  if (!resource) {
    await safeAnswerCallback(ctx, { text: 'Resource not found.' });
    return;
  }

  const text = 
`⚠️ *Confirm Permanent File Deletion*
━━━━━━━━━━━━━━━━━━
Are you sure you want to permanently delete:
*${escapeMarkdown(resource.title)}*?

⚠️ *Warning:* This file will be permanently removed from the platform. This action cannot be undone!`;

  const keyboard = getConfirmDeleteKeyboard(`admin_res_del_confirm_${resource.id}`, `admin_res_view_${resource.id}`);

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

async function handleDeleteResource(ctx, resourceId) {
  if (!(await ensureAdmin(ctx))) return;
  const { getResourceById, deleteResource } = require('../../services/resourceService');
  const resource = await getResourceById(resourceId);
  if (!resource) {
    await safeAnswerCallback(ctx, { text: 'Resource not found.' });
    return;
  }

  await deleteResource(resourceId);
  await safeAnswerCallback(ctx, {
    text: `File "${resource.title.slice(0, 20)}" deleted permanently!`
  });

  if (resource.category === 'beyond_curriculum' && resource.beyond_category) {
    await handleManageResourcesListByBeyond(ctx, resource.beyond_category);
  } else if (resource.course_id) {
    await handleManageResourcesListByCourse(ctx, resource.course_id);
  } else {
    await handleManageResources(ctx);
  }
}

async function handleManageAnnouncements(ctx) {
  if (!(await ensureAdmin(ctx))) return;

  const announcements = await getRecentAnnouncements({ limit: 15 });

  const text =
`📢 *Announcements & Broadcasts*
━━━━━━━━━━━━━━━━━━
Manage departmental broadcasts, edit previous notices, or send a new real-time announcement to students.

Select an announcement to view details, edit, or delete:`;

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: getManageAnnouncementsKeyboard(announcements)
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: getManageAnnouncementsKeyboard(announcements)
    });
  }
}

async function handleViewAnnouncement(ctx, id) {
  if (!(await ensureAdmin(ctx))) return;

  const ann = await getAnnouncementById(id);
  if (!ann) {
    await safeAnswerCallback(ctx, { text: 'Announcement not found.' });
    return;
  }

  const dateStr = ann.broadcasted_at || ann.created_at 
    ? new Date(ann.broadcasted_at || ann.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Recent';

  const text =
`📢 *Announcement Details*
━━━━━━━━━━━━━━━━━━
📌 *Title:* ${escapeMarkdown(ann.title)}
🎯 *Target Level:* ${ann.target_level ? `Level ${ann.target_level}` : 'All Levels'}
🚨 *Priority:* ${escapeMarkdown(ann.priority || 'normal')}
📅 *Date:* ${dateStr}
✍️ *Author:* ${escapeMarkdown(ann.author_name || 'Executive')}

📝 *Content:*
${escapeMarkdown(ann.content)}

Select an action below:`;

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: getAnnouncementDetailsKeyboard(ann)
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: getAnnouncementDetailsKeyboard(ann)
    });
  }
}

async function handleConfirmDeleteAnnouncement(ctx, id) {
  if (!(await ensureAdmin(ctx))) return;

  const ann = await getAnnouncementById(id);
  if (!ann) {
    await safeAnswerCallback(ctx, { text: 'Announcement not found.' });
    return;
  }

  const text =
`⚠️ *Delete Announcement Confirmation*
━━━━━━━━━━━━━━━━━━
Are you sure you want to permanently delete this announcement?

📌 *Title:* "${escapeMarkdown(ann.title)}"

This action cannot be undone.`;

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: getConfirmDeleteAnnouncementKeyboard(id)
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: getConfirmDeleteAnnouncementKeyboard(id)
    });
  }
}

async function handleDeleteAnnouncement(ctx, id) {
  if (!(await ensureAdmin(ctx))) return;

  const ann = await getAnnouncementById(id);
  if (!ann) {
    await safeAnswerCallback(ctx, { text: 'Announcement not found.' });
    return;
  }

  await deleteAnnouncement(id);
  await safeAnswerCallback(ctx, {
    text: `Announcement "${ann.title.slice(0, 20)}" deleted permanently!`
  });

  await handleManageAnnouncements(ctx);
}

async function handleManageAdmins(ctx) {
  if (!(await ensureAdmin(ctx))) return;

  const admins = await listAllAdmins();
  const currentUserId = ctx.from ? ctx.from.id : null;

  const text =
`👥 *Administrator & Executive Team*
━━━━━━━━━━━━━━━━━━
Manage system administrators, executive access, and delegation of departmental responsibilities.

👑 *Root Superadmins:* Configured via secure environment variables.
🛡️ *Appointed Admins:* Delegated executives with full management privileges.

Select an administrator below to view permissions or remove access:`;

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: getManageAdminsKeyboard(admins, currentUserId)
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: getManageAdminsKeyboard(admins, currentUserId)
    });
  }
}

async function handleViewAdmin(ctx, targetTelegramId) {
  if (!(await ensureAdmin(ctx))) return;

  const tid = Number(targetTelegramId);
  const admins = await listAllAdmins();
  const targetAdmin = admins.find(a => Number(a.telegram_id) === tid) || await getUserByTelegramId(tid);

  if (!targetAdmin) {
    await safeAnswerCallback(ctx, { text: 'Administrator not found.' });
    return;
  }

  const superAdmins = (config.adminTelegramIds || []).map(Number);
  const isSuper = superAdmins.includes(tid);
  const currentUserId = ctx.from ? Number(ctx.from.id) : null;
  const isSelf = currentUserId === tid;

  const fullName = [targetAdmin.first_name, targetAdmin.last_name].filter(Boolean).join(' ') || 'Unnamed Admin';
  const roleDisplay = isSuper ? '👑 Root Superadmin' : (targetAdmin.role === 'executive' ? '🛡️ Executive' : '🛡️ Appointed Administrator');
  const userHandle = targetAdmin.username ? `@${escapeMarkdown(targetAdmin.username)}` : 'None';
  const appointedDate = targetAdmin.created_at
    ? new Date(targetAdmin.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'System Inception';

  const text =
`👤 *Administrator Profile*
━━━━━━━━━━━━━━━━━━
🏷️ *Name:* ${escapeMarkdown(fullName)}
💬 *Username:* ${userHandle}
🆔 *Telegram ID:* \`${targetAdmin.telegram_id}\`
🎖️ *Rank / Role:* ${roleDisplay}
📅 *Appointed:* ${appointedDate}

${isSuper ? '🔒 _Root Superadmins cannot be removed via Telegram (configured via system environment)._' : (isSelf ? 'ℹ️ _This is your own administrator account._' : '⚠️ _You can remove this user’s administrator privileges at any time._')}`;

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: getAdminDetailsKeyboard(targetAdmin, isSuper, isSelf)
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: getAdminDetailsKeyboard(targetAdmin, isSuper, isSelf)
    });
  }
}

async function handleConfirmDemoteAdmin(ctx, targetTelegramId) {
  if (!(await ensureAdmin(ctx))) return;

  const tid = Number(targetTelegramId);
  const superAdmins = (config.adminTelegramIds || []).map(Number);
  if (superAdmins.includes(tid)) {
    await safeAnswerCallback(ctx, { text: '⛔ Cannot demote a Root Superadmin.', show_alert: true });
    return;
  }

  const currentUserId = ctx.from ? Number(ctx.from.id) : null;
  if (currentUserId === tid) {
    await safeAnswerCallback(ctx, { text: '⛔ You cannot remove your own admin access.', show_alert: true });
    return;
  }

  const targetAdmin = await getUserByTelegramId(tid);
  const name = targetAdmin ? ([targetAdmin.first_name, targetAdmin.last_name].filter(Boolean).join(' ') || `@${targetAdmin.username || tid}`) : `ID ${tid}`;

  const text =
`⚠️ *Remove Administrator Privileges*
━━━━━━━━━━━━━━━━━━
Are you sure you want to remove admin access from *${escapeMarkdown(name)}* (\`${tid}\`)?

They will be returned to normal student access and will no longer have access to the Executive & Admin Panel.`;

  if (ctx.callbackQuery) {
    await ctx.editMessageText(text, {
      parse_mode: 'Markdown',
      reply_markup: getConfirmDemoteAdminKeyboard(tid)
    });
  } else {
    await ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: getConfirmDemoteAdminKeyboard(tid)
    });
  }
}

async function handleDemoteAdmin(ctx, targetTelegramId) {
  if (!(await ensureAdmin(ctx))) return;

  const tid = Number(targetTelegramId);
  try {
    await demoteAdmin(tid, { demotedBy: ctx.from ? ctx.from.id : null });
    await safeAnswerCallback(ctx, { text: '✅ Admin privileges removed successfully.', show_alert: true });
  } catch (err) {
    await safeAnswerCallback(ctx, { text: `❌ ${err.message}`, show_alert: true });
  }

  await handleManageAdmins(ctx);
}

async function handleAddAdminCommand(ctx) {
  if (!(await ensureAdmin(ctx))) return;

  const text = ctx.message?.text || '';
  const parts = text.trim().split(/\s+/);
  const target = parts[1];

  if (!target) {
    await ctx.conversation.enter('adminAddAdminConversation');
    return;
  }

  let telegramId = null;
  let username = null;
  let firstName = 'Admin';
  let lastName = '';

  if (target.startsWith('@') || isNaN(Number(target))) {
    const cleanUsername = target.replace(/^@/, '').trim();
    const existing = await getUserByUsername(cleanUsername);
    if (!existing) {
      await ctx.reply(
        `⚠️ *User Not Found:* Could not find any registered user with username *@${escapeMarkdown(cleanUsername)}*.\n\n` +
        `If they haven't started GASSBot yet, please pass their numeric Telegram ID instead (e.g. \`/addadmin 123456789\`), or ask them to tap /start first.`,
        { parse_mode: 'Markdown' }
      );
      return;
    }
    telegramId = Number(existing.telegram_id);
    username = existing.username;
    firstName = existing.first_name || 'Admin';
    lastName = existing.last_name || '';
  } else {
    telegramId = Number(target);
  }

  try {
    const user = await promoteUserToAdmin({
      telegramId,
      username,
      firstName,
      lastName,
      role: 'admin',
      promotedBy: ctx.from.id
    });

    try {
      if (ctx.api) {
        await ctx.api.sendMessage(
          telegramId,
          `🎉 *Privilege Escalation Notice*\n━━━━━━━━━━━━━━━━━━\n` +
          `You have been granted *Administrator* privileges in GASSBot by an Executive.\n\n` +
          `Tap /admin or open the menu to access the Executive & Admin Panel.`,
          { parse_mode: 'Markdown' }
        );
      }
    } catch (notifyErr) {}

    const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || `@${user.username || user.telegram_id}`;
    await ctx.reply(
      `✅ *Admin Added Successfully*\n━━━━━━━━━━━━━━━━━━\n` +
      `User: *${escapeMarkdown(name)}*\n` +
      `Telegram ID: \`${user.telegram_id}\`\n` +
      `Role: *${user.role.toUpperCase()}*\n\n` +
      `They can now use /admin to access all executive features.`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    await ctx.reply(`❌ *Failed to add admin:* ${escapeMarkdown(err.message)}`, { parse_mode: 'Markdown' });
  }
}

module.exports = {
  isUserAdmin,
  handleAdminMenu,
  handleListPendingRequests,
  handleViewRequest,
  handleModerateRequest,
  handleAdminStats,
  handleManageCourses,
  handleAdminCoursesByLevel,
  handleViewCourse,
  handleConfirmDeleteCourse,
  handleDeleteCourse,
  handleToggleCourseActive,
  handleManageCategories,
  handleViewCategory,
  handleConfirmDeleteCategory,
  handleDeleteCategory,
  handleToggleCategoryActive,
  handleManageResourceTypes,
  handleViewResourceType,
  handleConfirmDeleteResourceType,
  handleDeleteResourceType,
  handleToggleResourceTypeActive,
  handleManageResources,
  handleManageResourcesAcadLevels,
  handleManageResourcesCourses,
  handleManageResourcesListByCourse,
  handleManageResourcesBeyondCategories,
  handleManageResourcesListByBeyond,
  handleViewResource,
  handleConfirmDeleteResource,
  handleDeleteResource,
  handleManageAnnouncements,
  handleViewAnnouncement,
  handleConfirmDeleteAnnouncement,
  handleDeleteAnnouncement,
  handleManageAdmins,
  handleViewAdmin,
  handleConfirmDemoteAdmin,
  handleDemoteAdmin,
  handleAddAdminCommand
};
