const { InlineKeyboard } = require('grammy');

function getAdminPanelKeyboard() {
  return new InlineKeyboard()
    .text('📥 Review Pending Requests', 'admin_requests')
    .row()
    .text('📢 Broadcast Announcement', 'admin_broadcast')
    .row()
    .text('📊 Platform Statistics', 'admin_stats')
    .row()
    .text('🏠 Return to Main Menu', 'menu_main');
}

function getRequestModerationKeyboard(requestId, currentIndex = 0, totalCount = 1, prevId = null, nextId = null) {
  const kb = new InlineKeyboard()
    .text('✅ Approve', `admin_req_approve_${requestId}`)
    .text('❌ Reject', `admin_req_reject_${requestId}`)
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
    .text('🏠 Main Menu', 'menu_main');

  return kb;
}

module.exports = {
  getAdminPanelKeyboard,
  getRequestModerationKeyboard
};
