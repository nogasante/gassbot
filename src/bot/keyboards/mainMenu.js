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

function getPersistentMenuKeyboard(isAdmin = false) {
  const kb = new Keyboard()
    .text('📚 Academic').text('🚀 Beyond').text('🔍 Find Resource')
    .row()
    .text('📝 Request File').text('🌐 Web App').text('🔔 Alerts')
    .row();

  if (isAdmin) {
    kb.text('⚡ Admin Panel').text('➕ Upload File').text('ℹ️ About');
  } else {
    kb.text('ℹ️ About GASS').text('📲 Get App').text('💬 Help');
  }

  return kb.resized().persistent();
}

module.exports = {
  getMainMenuKeyboard,
  getReplyMenuKeyboard: getPersistentMenuKeyboard,
  getPersistentMenuKeyboard
};
