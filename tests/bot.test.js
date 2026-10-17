const { expect } = require('chai');
const { createBot } = require('../src/bot');
const { getMainMenuKeyboard, getReplyMenuKeyboard } = require('../src/bot/keyboards/mainMenu');
const { getLevelsKeyboard, getSemestersKeyboard, getCoursesKeyboard } = require('../src/bot/keyboards/academic');
const { getBeyondCategoriesKeyboard, beyondCategories } = require('../src/bot/keyboards/beyond');
const { getAdminPanelKeyboard, getRequestModerationKeyboard } = require('../src/bot/keyboards/admin');

describe('GASS Telegram Bot Components', () => {
  describe('Bot Instantiation', () => {
    it('should instantiate grammY bot with valid token or fallback', () => {
      const bot = createBot('123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ');
      expect(bot).to.exist;
      expect(bot.isInited()).to.be.false;
    });
  });

  describe('Keyboards Generation', () => {
    it('should generate main menu inline keyboard with academic, beyond, webapp, and admin options', () => {
      const studentKb = getMainMenuKeyboard(false);
      expect(studentKb.inline_keyboard).to.be.an('array');

      const adminKb = getMainMenuKeyboard(true);
      const flattenedButtons = adminKb.inline_keyboard.flat();
      const adminBtn = flattenedButtons.find(b => b.text.includes('Admin'));
      expect(adminBtn).to.exist;

      const gassaAppBtn = flattenedButtons.find(b => b.text.includes('Gassa App'));
      expect(gassaAppBtn).to.exist;
      expect(gassaAppBtn.url).to.exist;
    });

    it('should generate academic levels and semester keyboards', () => {
      const levelsKb = getLevelsKeyboard();
      const lvlButtons = levelsKb.inline_keyboard.flat();
      expect(lvlButtons.some(b => b.callback_data === 'acad_lvl_100')).to.be.true;
      expect(lvlButtons.some(b => b.callback_data === 'acad_lvl_400')).to.be.true;

      const semKb = getSemestersKeyboard(200);
      const semButtons = semKb.inline_keyboard.flat();
      expect(semButtons.some(b => b.callback_data === 'acad_sem_200_1')).to.be.true;
      expect(semButtons.some(b => b.callback_data === 'acad_sem_200_2')).to.be.true;
    });

    it('should generate Beyond Curriculum category buttons', () => {
      const beyondKb = getBeyondCategoriesKeyboard();
      const buttons = beyondKb.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'beyond_pillar_programming_tools')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'beyond_pillar_data_science_ml')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'beyond_pillar_careers_opportunities')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'beyond_pillar_research_thesis')).to.be.true;
      expect(beyondCategories.length).to.equal(4);
    });

    it('should generate Admin moderation and action keyboards with navigation', () => {
      const adminKb = getAdminPanelKeyboard();
      const adminButtons = adminKb.inline_keyboard.flat();
      expect(adminButtons.some(b => b.callback_data === 'admin_requests')).to.be.true;
      expect(adminButtons.some(b => b.callback_data === 'admin_broadcast')).to.be.true;

      const modKb = getRequestModerationKeyboard(42, 0, 1);
      const modButtons = modKb.inline_keyboard.flat();
      const fulfillBtn = modButtons.find(b => b.callback_data === 'admin_req_approve_42');
      const dismissBtn = modButtons.find(b => b.callback_data === 'admin_req_reject_42');
      expect(fulfillBtn).to.exist;
      expect(fulfillBtn.text).to.include('Upload & Fulfill');
      expect(dismissBtn).to.exist;
      expect(dismissBtn.text).to.include('Dismiss Request');

      const pagedKb = getRequestModerationKeyboard(42, 1, 3, 41, 43);
      const pagedButtons = pagedKb.inline_keyboard.flat();
      expect(pagedButtons.some(b => b.callback_data === 'admin_req_view_41_0')).to.be.true;
      expect(pagedButtons.some(b => b.callback_data === 'admin_req_view_43_2')).to.be.true;
    });
  });

  describe('Markdown Formatting & Sanitization', () => {
    const { escapeMarkdown } = require('../src/bot/utils/format');

    it('should escape Telegram Markdown v1 special characters', () => {
      const input = 'STAT_151 [Lecture_Notes] *urgent* `code`';
      const output = escapeMarkdown(input);
      expect(output).to.equal('STAT\\_151 \\[Lecture\\_Notes\\] \\*urgent\\* \\`code\\`');
    });

    it('should handle null, undefined, or empty values safely', () => {
      expect(escapeMarkdown(null)).to.equal('');
      expect(escapeMarkdown(undefined)).to.equal('');
      expect(escapeMarkdown('')).to.equal('');
    });
  });

  describe('Admin Authorization', () => {
    const { isUserAdmin } = require('../src/bot/handlers/admin');

    it('should grant access to admin telegram id', () => {
      const { config } = require('../src/config');
      config.adminTelegramIds = [999888];
      expect(isUserAdmin(999888, null)).to.be.true;
      expect(isUserAdmin(123456, null)).to.be.false;
    });

    it('should grant access to user with admin or executive role in database', () => {
      expect(isUserAdmin(123456, { role: 'admin' })).to.be.true;
      expect(isUserAdmin(123456, { role: 'executive' })).to.be.true;
      expect(isUserAdmin(123456, { role: 'student' })).to.be.false;
    });
  });
});
