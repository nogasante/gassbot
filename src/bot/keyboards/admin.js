const { InlineKeyboard } = require('grammy');

function getAdminPanelKeyboard(pendingCount = 0) {
  const reqLabel = pendingCount > 0 ? `📥 Student Requests (${pendingCount})` : '📥 Student Requests';
  return new InlineKeyboard()
    .text(reqLabel, 'admin_requests')
    .row()
    .text('📚 Academic Courses', 'admin_manage_courses')
    .text('🚀 Beyond Curriculum', 'admin_manage_categories')
    .row()
    .text('📂 Manage Uploaded Files', 'admin_manage_resources')
    .text('📢 Announcements', 'admin_manage_announcements')
    .row()
    .text('🏷️ Resource Types', 'admin_manage_types')
    .text('👥 Manage Admins', 'admin_manage_admins')
    .row()
    .text('📢 Quick Broadcast', 'admin_broadcast')
    .text('🏠 Main Menu', 'menu_main');
}

function getManageCoursesKeyboard(levels = [100, 200, 300, 400]) {
  const kb = new InlineKeyboard()
    .text('➕ Add New Course', 'admin_course_add')
    .row();

  levels.forEach(lvl => {
    kb.text(`Level ${lvl}`, `admin_crs_lvl_${lvl}`);
  });
  kb.row();
  kb.text('🔙 Back to Admin Panel', 'menu_admin');
  return kb;
}

function getCourseDetailsKeyboard(course, backLevel = null, resources = []) {
  const kb = new InlineKeyboard();

  // In-context Add Material button
  kb.text(`➕ Upload Material to ${course.code}`, `admin_crs_add_res_${course.id}`).row();

  // Existing materials list (up to 6 direct buttons)
  if (resources && resources.length > 0) {
    resources.slice(0, 6).forEach(r => {
      const shortTitle = r.title.length > 28 ? `${r.title.slice(0, 25)}...` : r.title;
      kb.text(`📄 ${shortTitle}`, `admin_res_view_${r.id}`).row();
    });
    if (resources.length > 6) {
      kb.text(`📂 View All ${resources.length} Files`, `admin_res_crs_${course.id}`).row();
    }
  }

  // Course controls
  const toggleAction = course.is_active ? '⏸️ Deactivate Course' : '✅ Activate Course';
  kb.text('✏️ Edit Course Name', `admin_crs_edit_title_${course.id}`)
    .text('✏️ Edit Course Code', `admin_crs_edit_code_${course.id}`)
    .row()
    .text('🗑️ Delete Course Completely', `admin_crs_del_${course.id}`)
    .row()
    .text(`🔄 Toggle Active / Inactive`, `admin_crs_toggle_${course.id}`)
    .row();

  // Navigation
  kb.text('🔙 Back to Level Courses', `admin_crs_lvl_${backLevel || course.level}`)
    .text('🏠 Admin Panel', 'menu_admin');

  return kb;
}

function getManageCategoriesKeyboard(categories = []) {
  const kb = new InlineKeyboard()
    .text('➕ Add Beyond Category', 'admin_cat_add')
    .row();

  categories.forEach((cat, idx) => {
    const statusMark = cat.is_active ? '✅' : '⏸️';
    kb.text(`${statusMark} ${cat.label}`, `admin_cat_view_${cat.key}`);
    if ((idx + 1) % 2 === 0) kb.row();
  });
  kb.row();
  kb.text('🔙 Back to Admin Panel', 'menu_admin');
  return kb;
}

function getCategoryDetailsKeyboard(category) {
  const toggleAction = category.is_active ? 'Pause / Deactivate' : 'Activate';
  return new InlineKeyboard()
    .text('✏️ Edit Label', `admin_cat_edit_${category.key}`)
    .text(`🔄 ${toggleAction}`, `admin_cat_toggle_${category.key}`)
    .row()
    .text('🗑️ Delete Category Completely', `admin_cat_del_${category.key}`)
    .row()
    .text('🔙 Back to Categories', 'admin_manage_categories')
    .text('🏠 Main Menu', 'menu_main');
}

function getManageResourceTypesKeyboard(types = []) {
  const kb = new InlineKeyboard()
    .text('➕ Add Resource Type', 'admin_type_add')
    .row();

  types.forEach((t, idx) => {
    const statusMark = t.is_active ? '✅' : '⏸️';
    kb.text(`${statusMark} ${t.label}`, `admin_type_view_${t.key}`);
    if ((idx + 1) % 2 === 0) kb.row();
  });
  kb.row();
  kb.text('🔙 Back to Admin Panel', 'menu_admin');
  return kb;
}

function getResourceTypeDetailsKeyboard(type) {
  const toggleAction = type.is_active ? 'Pause / Deactivate' : 'Activate';
  return new InlineKeyboard()
    .text('✏️ Edit Label', `admin_type_edit_${type.key}`)
    .text(`🔄 ${toggleAction}`, `admin_type_toggle_${type.key}`)
    .row()
    .text('🗑️ Delete Type Completely', `admin_type_del_${type.key}`)
    .row()
    .text('🔙 Back to Resource Types', 'admin_manage_types')
    .text('🏠 Main Menu', 'menu_main');
}

function getResourceDetailsKeyboard(resource) {
  const kb = new InlineKeyboard()
    .text('✏️ Rename / Edit Title', `admin_res_edit_title_${resource.id}`)
    .row()
    .text('🗑️ Delete File Completely', `admin_res_del_${resource.id}`)
    .row();

  if (resource.category === 'beyond_curriculum' && resource.beyond_category) {
    kb.text('🔙 Back to Files', `admin_res_byd_${resource.beyond_category}`);
  } else if (resource.course_id) {
    kb.text('🔙 Back to Files', `admin_res_crs_${resource.course_id}`);
  } else {
    kb.text('🔙 Back to Files', 'admin_manage_resources');
  }
  kb.text('🏠 Admin Panel', 'menu_admin');
  return kb;
}

function getCategoryUnifiedKeyboard(category, subTopics = []) {
  const kb = new InlineKeyboard();

  for (let i = 0; i < subTopics.length; i += 2) {
    const s1 = subTopics[i];
    const s2 = subTopics[i + 1];
    if (s2) {
      kb.text(s1.label, `admin_byd_topic_${s1.key}`).text(s2.label, `admin_byd_topic_${s2.key}`).row();
    } else {
      kb.text(s1.label, `admin_byd_topic_${s1.key}`).row();
    }
  }

  kb.text('➕ Add New Topic', `admin_byd_add_topic_${category.key}`).row();
  kb.text('✏️ Edit Category Name', `admin_cat_edit_${category.key}`).row();
  kb.text('🔙 Back to Categories', 'admin_manage_beyond_unified')
    .text('🏠 Admin Panel', 'menu_admin');

  return kb;
}

function getTopicDetailsKeyboard(topic, resources = []) {
  const kb = new InlineKeyboard();

  // In-context Add Material button
  kb.text(`➕ Upload Material to ${topic.label}`, `admin_byd_add_res_${topic.key}`).row();

  // Existing materials list (up to 6 direct buttons)
  if (resources && resources.length > 0) {
    resources.slice(0, 6).forEach(r => {
      const shortTitle = r.title.length > 28 ? `${r.title.slice(0, 25)}...` : r.title;
      kb.text(`📄 ${shortTitle}`, `admin_res_view_${r.id}`).row();
    });
    if (resources.length > 6) {
      kb.text(`📂 View All ${resources.length} Files`, `admin_res_byd_sub_${topic.key}`).row();
    }
  }

  kb.text('✏️ Edit Topic Name', `admin_byd_edit_topic_${topic.key}`)
    .text('🗑️ Delete Topic', `admin_byd_del_topic_${topic.key}`)
    .row();

  const backTarget = topic.pillar_key ? `admin_manage_cat_unified_${topic.pillar_key}` : 'admin_manage_beyond_unified';
  kb.text('🔙 Back to Topics', backTarget)
    .text('🏠 Admin Panel', 'menu_admin');

  return kb;
}

function getConfirmDeleteKeyboard(confirmData, cancelData) {
  return new InlineKeyboard()
    .text('💥 Confirm Delete', confirmData)
    .text('❌ Cancel', cancelData);
}

function getRequestModerationKeyboard(requestId, currentIndex = 0, totalCount = 1, prevId = null, nextId = null) {
  const kb = new InlineKeyboard()
    .text('➕ Upload & Fulfill Material', `admin_req_approve_${requestId}`)
    .row()
    .text('🗑️ Dismiss Request', `admin_req_reject_${requestId}`)
    .row();

  if (totalCount > 1) {
    if (prevId) {
      kb.text('⬅️ Prev', `admin_req_view_${prevId}_${currentIndex - 1}`);
    }
    if (nextId) {
      kb.text('Next ➡️', `admin_req_view_${nextId}_${currentIndex + 1}`);
    }
    kb.row();
  }

  kb.text('🔙 Back to Requests List', 'admin_requests')
    .text('🏠 Admin Panel', 'menu_admin');

  return kb;
}

function getManageAnnouncementsKeyboard(announcements = []) {
  const kb = new InlineKeyboard()
    .text('➕ Broadcast New Announcement', 'admin_broadcast')
    .row();

  announcements.forEach((a) => {
    const shortTitle = a.title.length > 28 ? `${a.title.slice(0, 25)}...` : a.title;
    const prioEmoji = a.priority === 'urgent' ? '🚨' : (a.priority === 'event' ? '📅' : '📢');
    kb.text(`${prioEmoji} ${shortTitle}`, `admin_ann_view_${a.id}`).row();
  });

  kb.text('🔙 Back to Admin Panel', 'menu_admin');
  return kb;
}

function getAnnouncementDetailsKeyboard(announcement) {
  return new InlineKeyboard()
    .text('✏️ Edit Title', `admin_ann_edit_title_${announcement.id}`)
    .text('✏️ Edit Content', `admin_ann_edit_content_${announcement.id}`)
    .row()
    .text('🗑️ Delete Announcement', `admin_ann_del_${announcement.id}`)
    .row()
    .text('🔙 Back to Announcements', 'admin_manage_announcements')
    .text('🏠 Admin Panel', 'menu_admin');
}

function getConfirmDeleteAnnouncementKeyboard(announcementId) {
  return new InlineKeyboard()
    .text('💥 Confirm Delete', `admin_ann_del_confirm_${announcementId}`)
    .text('❌ Cancel', `admin_ann_view_${announcementId}`);
}

function getManageAdminsKeyboard(admins = [], currentUserId = null) {
  const kb = new InlineKeyboard()
    .text('➕ Add New Admin', 'admin_add_admin')
    .row();

  admins.forEach((admin) => {
    const isSuper = admin.is_superadmin;
    const badge = isSuper ? '👑' : '🛡️';
    const name = [admin.first_name, admin.last_name].filter(Boolean).join(' ') || (admin.username ? `@${admin.username}` : `ID: ${admin.telegram_id}`);
    const isSelf = currentUserId && Number(currentUserId) === Number(admin.telegram_id);
    const suffix = isSelf ? ' (You)' : '';
    const label = `${badge} ${name}${suffix}`;
    kb.text(label, `admin_view_admin_${admin.telegram_id}`).row();
  });

  kb.text('🔙 Back to Admin Panel', 'menu_admin');
  return kb;
}

function getAdminDetailsKeyboard(adminUser, isSuperadmin = false, isSelf = false) {
  const kb = new InlineKeyboard();
  if (!isSuperadmin && !isSelf) {
    kb.text('🗑️ Remove Admin Privileges', `admin_demote_confirm_${adminUser.telegram_id}`).row();
  }
  kb.text('🔙 Back to Admins', 'admin_manage_admins')
    .text('🏠 Admin Panel', 'menu_admin');
  return kb;
}

function getConfirmDemoteAdminKeyboard(telegramId) {
  return new InlineKeyboard()
    .text('⚠️ Yes, Remove Admin', `admin_demote_do_${telegramId}`)
    .text('❌ Cancel', `admin_view_admin_${telegramId}`);
}

module.exports = {
  getAdminPanelKeyboard,
  getManageCoursesKeyboard,
  getCourseDetailsKeyboard,
  getManageCategoriesKeyboard,
  getCategoryDetailsKeyboard,
  getCategoryUnifiedKeyboard,
  getTopicDetailsKeyboard,
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
};
