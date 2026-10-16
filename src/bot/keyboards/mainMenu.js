const { InlineKeyboard, Keyboard } = require('grammy');
const { config } = require('../../config');

function getMainMenuKeyboard(isAdmin = false) {
  const keyboard = new InlineKeyboard()
    .text('📚 Academic Resources', 'menu_academic')
    .text('🚀 Beyond Curriculum', 'menu_beyond')
    .row()
    .text('🔍 Search Resources', 'menu_search')
    .text('📝 Request Resource', 'menu_request')
    .row()
    .text('🔔 Notifications', 'menu_notifications')
    .text('ℹ️ Help & About', 'menu_help')
    .row()
    .url('🌐 Launch Web App', config.miniAppUrl)
    .text('📲 Get the App', 'menu_app');

  if (isAdmin) {
    keyboard.row().text('⚡ Admin Moderation Panel', 'menu_admin');
  }

  return keyboard;
}

function getReplyMenuKeyboard() {
  return new Keyboard()
    .text('📚 Academic Resources').text('🚀 Beyond Curriculum').row()
    .text('🔍 Search').text('📝 Request Resource').row()
    .text('🔔 Notifications').text('🌐 Web App').text('ℹ️ About')
    .resized();
}

module.exports = {
  getMainMenuKeyboard,
  getReplyMenuKeyboard
};
