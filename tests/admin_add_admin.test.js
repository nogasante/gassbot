const { expect } = require('chai');
const request = require('supertest');
const { setupTestDb, seedTestDb } = require('./helpers/testDb');
const { config } = require('../src/config');
const {
  promoteUserToAdmin,
  demoteAdmin,
  listAllAdmins,
  getUserByUsername,
  findOrCreateUser,
  getUserByTelegramId
} = require('../src/services/userService');
const {
  getAdminPanelKeyboard,
  getManageAdminsKeyboard,
  getAdminDetailsKeyboard,
  getConfirmDemoteAdminKeyboard
} = require('../src/bot/keyboards/admin');
const {
  handleManageAdmins,
  handleViewAdmin,
  handleConfirmDemoteAdmin,
  handleDemoteAdmin,
  handleAddAdminCommand,
  isUserAdmin
} = require('../src/bot/handlers/admin');
const { createServer } = require('../src/api/server');

describe('Administrator Management System (Add, View, List, Demote Admins)', () => {
  let pool;
  let app;
  const rootSuperAdminId = 8603471859;

  before(async () => {
    config.adminTelegramIds = [rootSuperAdminId];
    pool = await setupTestDb();
    await seedTestDb(pool);
    app = createServer(null);
  });

  describe('Service Layer (userService)', () => {
    it('should promote an existing student to admin', async () => {
      const student = await findOrCreateUser({
        telegramId: 111222333,
        username: 'student_kwame',
        firstName: 'Kwame',
        lastName: 'Mensah'
      });
      expect(student.role).to.equal('student');

      const promoted = await promoteUserToAdmin({
        telegramId: 111222333,
        role: 'admin',
        promotedBy: rootSuperAdminId
      });

      expect(promoted.role).to.equal('admin');
      expect(promoted.telegram_id.toString()).to.equal('111222333');

      // Verify in DB
      const fresh = await getUserByTelegramId(111222333);
      expect(fresh.role).to.equal('admin');
    });

    it('should pre-register and promote a new user who has not messaged the bot yet', async () => {
      const newAdmin = await promoteUserToAdmin({
        telegramId: 444555666,
        username: 'new_exec',
        firstName: 'Ama',
        lastName: 'Serwaa',
        role: 'executive',
        promotedBy: rootSuperAdminId
      });

      expect(newAdmin.role).to.equal('executive');
      expect(newAdmin.first_name).to.equal('Ama');
      expect(newAdmin.username).to.equal('new_exec');

      const fresh = await getUserByTelegramId(444555666);
      expect(fresh).to.exist;
      expect(fresh.role).to.equal('executive');
    });

    it('should retrieve a user by username case-insensitively and handle leading @', async () => {
      const user = await getUserByUsername('@student_kwame');
      expect(user).to.exist;
      expect(user.telegram_id.toString()).to.equal('111222333');

      const userUpper = await getUserByUsername('STUDENT_KWAME');
      expect(userUpper).to.exist;
      expect(userUpper.id).to.equal(user.id);

      const notFound = await getUserByUsername('@non_existent_scholar');
      expect(notFound).to.be.null;
    });

    it('should list all admins including root superadmins', async () => {
      const admins = await listAllAdmins();
      expect(admins).to.be.an('array');
      expect(admins.length).to.be.at.least(2);

      const superAdminEntry = admins.find(a => Number(a.telegram_id) === rootSuperAdminId);
      expect(superAdminEntry).to.exist;
      expect(superAdminEntry.is_superadmin).to.be.true;

      const appointedAdmin = admins.find(a => Number(a.telegram_id) === 111222333);
      expect(appointedAdmin).to.exist;
      expect(appointedAdmin.is_superadmin).to.be.false;
      expect(appointedAdmin.role).to.equal('admin');
    });

    it('should demote an appointed admin back to student role', async () => {
      const demoted = await demoteAdmin(111222333, { demotedBy: rootSuperAdminId });
      expect(demoted).to.exist;
      expect(demoted.role).to.equal('student');

      const fresh = await getUserByTelegramId(111222333);
      expect(fresh.role).to.equal('student');
    });

    it('should prevent demoting a root superadmin configured in environment variables', async () => {
      try {
        await demoteAdmin(rootSuperAdminId, { demotedBy: 444555666 });
        expect.fail('Should have thrown error');
      } catch (err) {
        expect(err.message).to.include('Cannot demote a root superadmin');
      }
    });

    it('should prevent an admin from demoting themselves', async () => {
      try {
        await demoteAdmin(444555666, { demotedBy: 444555666 });
        expect.fail('Should have thrown error');
      } catch (err) {
        expect(err.message).to.include('cannot remove your own administrator privileges');
      }
    });
  });

  describe('Keyboards & UI Components', () => {
    it('Admin panel keyboard should contain Manage Admins option', () => {
      const kb = getAdminPanelKeyboard(0);
      const rows = kb.inline_keyboard;
      const flat = rows.flat();
      const hasAdminsBtn = flat.some(b => b.callback_data === 'admin_manage_admins' && b.text.includes('Manage Admins'));
      expect(hasAdminsBtn).to.be.true;
    });

    it('Manage Admins keyboard should generate Add Admin button and list all admins', () => {
      const mockAdmins = [
        { telegram_id: rootSuperAdminId, first_name: 'Nana', username: 'nana', is_superadmin: true },
        { telegram_id: 111222333, first_name: 'Kwame', username: 'kwame', is_superadmin: false }
      ];
      const kb = getManageAdminsKeyboard(mockAdmins, rootSuperAdminId);
      const rows = kb.inline_keyboard;
      const flat = rows.flat();

      const addBtn = flat.find(b => b.callback_data === 'admin_add_admin');
      expect(addBtn).to.exist;
      expect(addBtn.text).to.include('Add New Admin');

      const superBtn = flat.find(b => b.callback_data === `admin_view_admin_${rootSuperAdminId}`);
      expect(superBtn).to.exist;
      expect(superBtn.text).to.include('👑');
      expect(superBtn.text).to.include('(You)');

      const adminBtn = flat.find(b => b.callback_data === 'admin_view_admin_111222333');
      expect(adminBtn).to.exist;
      expect(adminBtn.text).to.include('🛡️');
    });

    it('Admin details keyboard should show remove button only for non-superadmin and non-self', () => {
      // Superadmin: no remove button
      const superKb = getAdminDetailsKeyboard({ telegram_id: rootSuperAdminId }, true, true);
      const superFlat = superKb.inline_keyboard.flat();
      const superRemove = superFlat.find(b => b.callback_data.includes('demote'));
      expect(superRemove).to.be.undefined;

      // Appointed admin viewed by superadmin: remove button present
      const appointedKb = getAdminDetailsKeyboard({ telegram_id: 111222333 }, false, false);
      const appointedFlat = appointedKb.inline_keyboard.flat();
      const appointedRemove = appointedFlat.find(b => b.callback_data === 'admin_demote_confirm_111222333');
      expect(appointedRemove).to.exist;
      expect(appointedRemove.text).to.include('Remove Admin');
    });

    it('Confirm demote keyboard should provide confirm and cancel options', () => {
      const kb = getConfirmDemoteAdminKeyboard(111222333);
      const flat = kb.inline_keyboard.flat();
      const confirm = flat.find(b => b.callback_data === 'admin_demote_do_111222333');
      const cancel = flat.find(b => b.callback_data === 'admin_view_admin_111222333');
      expect(confirm).to.exist;
      expect(cancel).to.exist;
    });
  });

  describe('Telegram Bot Admin Handlers', () => {
    it('handleManageAdmins should render admin team overview', async () => {
      let sentText = '';
      let sentKb = null;
      const ctx = {
        from: { id: rootSuperAdminId },
        callbackQuery: { id: 'cb_1' },
        editMessageText: async (text, opts) => {
          sentText = text;
          sentKb = opts.reply_markup;
        },
        answerCallbackQuery: async () => {}
      };

      await handleManageAdmins(ctx);
      expect(sentText).to.include('Administrator & Executive Team');
      expect(sentKb).to.exist;
    });

    it('handleViewAdmin should render administrator profile details', async () => {
      let sentText = '';
      const ctx = {
        from: { id: rootSuperAdminId },
        callbackQuery: { id: 'cb_2' },
        editMessageText: async (text) => {
          sentText = text;
        },
        answerCallbackQuery: async () => {}
      };

      await handleViewAdmin(ctx, 444555666);
      expect(sentText).to.include('Administrator Profile');
      expect(sentText).to.include('444555666');
      expect(sentText).to.include('Ama Serwaa');
    });

    it('handleConfirmDemoteAdmin should reject demoting root superadmin with alert', async () => {
      let alertText = '';
      const ctx = {
        from: { id: rootSuperAdminId },
        callbackQuery: { id: 'cb_3' },
        answerCallbackQuery: async (opts) => {
          if (opts?.text) alertText = opts.text;
        }
      };

      await handleConfirmDemoteAdmin(ctx, rootSuperAdminId);
      expect(alertText).to.include('Cannot demote a Root Superadmin');
    });

    it('handleConfirmDemoteAdmin should render confirmation prompt for eligible admin', async () => {
      let sentText = '';
      let sentKb = null;
      const ctx = {
        from: { id: rootSuperAdminId },
        callbackQuery: { id: 'cb_4' },
        editMessageText: async (text, opts) => {
          sentText = text;
          sentKb = opts.reply_markup;
        },
        answerCallbackQuery: async () => {}
      };

      await handleConfirmDemoteAdmin(ctx, 444555666);
      expect(sentText).to.include('Remove Administrator Privileges');
      expect(sentText).to.include('444555666');
      expect(sentKb).to.exist;
    });

    it('handleDemoteAdmin should demote target and refresh admin list', async () => {
      let alertMsg = '';
      let refreshed = false;
      const ctx = {
        from: { id: rootSuperAdminId },
        callbackQuery: { id: 'cb_5' },
        answerCallbackQuery: async (opts) => {
          if (opts?.text) alertMsg = opts.text;
        },
        editMessageText: async () => {
          refreshed = true;
        }
      };

      await handleDemoteAdmin(ctx, 444555666);
      expect(alertMsg).to.include('Admin privileges removed successfully');
      expect(refreshed).to.be.true;

      const fresh = await getUserByTelegramId(444555666);
      expect(fresh.role).to.equal('student');
    });

    it('handleAddAdminCommand should add admin directly when numeric Telegram ID is passed', async () => {
      let replyText = '';
      const ctx = {
        from: { id: rootSuperAdminId },
        message: { text: '/addadmin 777888999' },
        reply: async (text) => {
          replyText = text;
        },
        api: {
          sendMessage: async () => {}
        }
      };

      await handleAddAdminCommand(ctx);
      expect(replyText).to.include('Admin Added Successfully');
      expect(replyText).to.include('777888999');

      const fresh = await getUserByTelegramId(777888999);
      expect(fresh.role).to.equal('admin');
    });

    it('ensureAdmin should block non-admin users from accessing admin features', async () => {
      let denied = false;
      const ctx = {
        from: { id: 999999999 }, // non-admin
        callbackQuery: {
          answerCallbackQuery: async (opts) => {
            if (opts?.text?.includes('Access denied')) denied = true;
          }
        },
        reply: async () => {}
      };

      await handleManageAdmins(ctx);
      expect(denied).to.be.true;
    });
  });

  describe('REST API Endpoints (/api/admins)', () => {
    it('GET /api/admins should return full list of administrators', async () => {
      const res = await request(app)
        .get('/api/admins')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.count).to.be.at.least(2);

      const superAdmin = res.body.data.find(a => Number(a.telegram_id) === rootSuperAdminId);
      expect(superAdmin).to.exist;
      expect(superAdmin.is_superadmin).to.be.true;
    });

    it('POST /api/admins should create or promote an admin', async () => {
      const res = await request(app)
        .post('/api/admins')
        .send({
          telegramId: 555666777,
          username: 'api_admin',
          firstName: 'Kofi',
          lastName: 'Boateng',
          role: 'admin'
        })
        .expect(201);

      expect(res.body.success).to.be.true;
      expect(res.body.data.role).to.equal('admin');
      expect(res.body.data.first_name).to.equal('Kofi');

      const check = await getUserByTelegramId(555666777);
      expect(check.role).to.equal('admin');
    });

    it('POST /api/admins should reject missing or invalid telegramId with 400', async () => {
      const res = await request(app)
        .post('/api/admins')
        .send({ username: 'missing_id' })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.include('telegramId is required');
    });

    it('DELETE /api/admins/:telegramId should remove admin privileges', async () => {
      const res = await request(app)
        .delete('/api/admins/555666777')
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data.role).to.equal('student');

      const check = await getUserByTelegramId(555666777);
      expect(check.role).to.equal('student');
    });

    it('DELETE /api/admins/:telegramId should reject demoting root superadmin with 403', async () => {
      const res = await request(app)
        .delete(`/api/admins/${rootSuperAdminId}`)
        .expect(403);

      expect(res.body.success).to.be.false;
      expect(res.body.error).to.include('Cannot demote a root superadmin');
    });
  });
});
