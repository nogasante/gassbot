const { InlineKeyboard, Keyboard } = require('grammy');
const { config } = require('../../config');

function getMainMenuKeyboard(isAdmin = false, playStoreUrl = null) {
  const url = playStoreUrl || config.brand.links?.playStore || config.appPlayStoreUrl;
  const miniAppUrl = config.miniAppUrl || config.brand.links?.miniApp;

  const keyboard = new InlineKeyboard()
    .text('📚 Academic Resources', 'menu_academic')
    .text('🚀 Beyond Curriculum', 'menu_beyond')
    .row()
    .text('🔍 Search Resources', 'menu_search')
    .text('📝 Request Resource', 'menu_request')
    .row();

  if (miniAppUrl && miniAppUrl.startsWith('https://')) {
    keyboard.webApp('🌐 Launch Student Portal', miniAppUrl).row();
  }

  keyboard
    .text('🔔 Notifications', 'menu_notifications')
    .text('ℹ️ About & Help', 'menu_help')
    .row()
    .url('📲 Gassa App (Google Play)', url);

  if (isAdmin) {
    keyboard.row().text('⚡ Admin Panel', 'menu_admin');
  }

  return keyboard;
}

function getPersistentMenuKeyboard(isAdmin = false) {
  const kb = new Keyboard()
    .text('📚 Academic').text('🚀 Beyond').text('🔍 Find Resource')
    .row()
    .text('📝 Request File').text('📲 Gassa App').text('🔔 Alerts')
    .row();

  if (isAdmin) {
    kb.text('⚡ Admin Panel').text('➕ Upload File').text('ℹ️ About');
  } else {
    kb.text('ℹ️ About GASS').text('📲 Gassa App').text('💬 Help');
  }

  return kb.resized().persistent();
}

module.exports = {
  getMainMenuKeyboard,
  getReplyMenuKeyboard: getPersistentMenuKeyboard,
  getPersistentMenuKeyboard
};
