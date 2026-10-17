const { expect } = require('chai');
const request = require('supertest');
const { createServer } = require('../src/api/server');
const { setupTestDb, seedTestDb } = require('./helpers/testDb');
const {
  handleBeyondMenu,
  handleBeyondPillarSelect,
  handleBeyondSubTopicSelect,
  handleBeyondResourceView
} = require('../src/bot/handlers/beyond');
const {
  getBeyondPillarsKeyboard,
  getBeyondSubTopicsKeyboard,
  getBeyondResourcesKeyboard,
  getResourceCardKeyboard
} = require('../src/bot/keyboards/beyond');
const categoryService = require('../src/services/categoryService');
const resourceService = require('../src/services/resourceService');

describe('Streamlined 4-Pillar Beyond Curriculum Flow', () => {
  let pool;
  let app;

  before(async () => {
    pool = await setupTestDb();
    await seedTestDb(pool);
    app = createServer(null);
  });

  describe('Keyboard Generation', () => {
    it('getBeyondPillarsKeyboard should generate 4 core pillars with 2-per-row layout', () => {
      const kb = getBeyondPillarsKeyboard();
      const buttons = kb.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'beyond_pillar_programming_tools')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'beyond_pillar_data_science_ml')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'beyond_pillar_careers_opportunities')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'beyond_pillar_research_thesis')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'menu_main')).to.be.true;
    });

    it('getBeyondSubTopicsKeyboard should generate tool and topic buttons for a pillar', () => {
      const subTopics = [
        { key: 'r', label: '📊 R Programming' },
        { key: 'python', label: '🐍 Python for Data Science' }
      ];
      const kb = getBeyondSubTopicsKeyboard('programming_tools', subTopics);
      const buttons = kb.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'beyond_sub_r')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'beyond_sub_python')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'menu_beyond')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'menu_main')).to.be.true;
    });

    it('getBeyondResourcesKeyboard should render materials as individual clickable buttons', () => {
      const resources = [
        { id: 101, title: 'ggplot2 Master Guide', resource_type: 'e_book' },
        { id: 102, title: 'R Tidyverse Cheat Sheet', resource_type: 'past_question' }
      ];
      const kb = getBeyondResourcesKeyboard('programming_tools', 'r', resources);
      const buttons = kb.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'beyond_res_101')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'beyond_res_102')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'beyond_pillar_programming_tools')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'menu_request')).to.be.true;
    });

    it('getResourceCardKeyboard should render download/open, bookmark, and back buttons', () => {
      const resTelegram = { id: 101, telegram_file_id: 'tg_file_123', beyond_sub_topic: 'r' };
      const kbTelegram = getResourceCardKeyboard(resTelegram, 'programming_tools', 'r');
      const buttonsTg = kbTelegram.inline_keyboard.flat();
      expect(buttonsTg.some(b => b.callback_data === 'res_send_101')).to.be.true;
      expect(buttonsTg.some(b => b.callback_data === 'res_bookmark_101')).to.be.true;
      expect(buttonsTg.some(b => b.callback_data === 'beyond_sub_r')).to.be.true;

      const resLink = { id: 102, file_url: 'https://example.com/guide.pdf', beyond_sub_topic: 'r' };
      const kbLink = getResourceCardKeyboard(resLink, 'programming_tools', 'r');
      const buttonsLink = kbLink.inline_keyboard.flat();
      expect(buttonsLink.some(b => b.url === 'https://example.com/guide.pdf')).to.be.true;
    });
  });

  describe('Beyond Bot Handlers Simulation', () => {
    it('handleBeyondMenu should edit message with 4 core pillars keyboard', async () => {
      let sentText = '';
      let sentMarkup = null;
      const ctx = {
        callbackQuery: { answerCallbackQuery: async () => {} },
        editMessageText: async (text, opts) => {
          sentText = text;
          sentMarkup = opts.reply_markup;
        }
      };

      await handleBeyondMenu(ctx);
      expect(sentText).to.include('Beyond Curriculum');
      const buttons = sentMarkup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'beyond_pillar_programming_tools')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'beyond_pillar_data_science_ml')).to.be.true;
    });

    it('handleBeyondPillarSelect should display sub-topics for selected pillar', async () => {
      let sentText = '';
      let sentMarkup = null;
      const ctx = {
        callbackQuery: { answerCallbackQuery: async () => {} },
        editMessageText: async (text, opts) => {
          sentText = text;
          sentMarkup = opts.reply_markup;
        }
      };

      await handleBeyondPillarSelect(ctx, 'programming_tools');
      expect(sentText).to.include('Programming & Tools');
      const buttons = sentMarkup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === 'beyond_sub_r')).to.be.true;
      expect(buttons.some(b => b.callback_data === 'beyond_sub_python')).to.be.true;
    });

    it('handleBeyondSubTopicSelect should display materials as clickable buttons', async () => {
      let sentText = '';
      let sentMarkup = null;
      const ctx = {
        callbackQuery: { answerCallbackQuery: async () => {} },
        editMessageText: async (text, opts) => {
          sentText = text;
          sentMarkup = opts.reply_markup;
        }
      };

      await handleBeyondSubTopicSelect(ctx, 'r');
      expect(sentText).to.include('R Programming');
      const buttons = sentMarkup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data.startsWith('beyond_res_'))).to.be.true;
      expect(buttons.some(b => b.callback_data === 'beyond_pillar_programming_tools')).to.be.true;
    });

    it('handleBeyondResourceView should render clean Resource Card', async () => {
      const allR = await resourceService.getResourcesByBeyondCategory(null, 'r');
      const testRes = allR[0];

      let sentText = '';
      let sentMarkup = null;
      const ctx = {
        callbackQuery: { answerCallbackQuery: async () => {} },
        editMessageText: async (text, opts) => {
          sentText = text;
          sentMarkup = opts.reply_markup;
        }
      };

      await handleBeyondResourceView(ctx, testRes.id);
      expect(sentText).to.include(testRes.title);
      expect(sentText).to.include('Topic:');
      const buttons = sentMarkup.inline_keyboard.flat();
      expect(buttons.some(b => b.callback_data === `res_bookmark_${testRes.id}`)).to.be.true;
      expect(buttons.some(b => b.callback_data === 'beyond_sub_r')).to.be.true;
    });
  });

  describe('Sub-topics REST API Endpoints', () => {
    it('GET /api/beyond-sub-topics should return all sub-topics across pillars', async () => {
      const res = await request(app).get('/api/beyond-sub-topics');
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.at.least(10);
    });

    it('GET /api/beyond-categories/:key/sub-topics should return only sub-topics for target pillar', async () => {
      const res = await request(app).get('/api/beyond-categories/data_science_ml/sub-topics');
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      const keys = res.body.data.map(s => s.key);
      expect(keys).to.include('data_analysis');
      expect(keys).to.include('ml');
      expect(keys).to.not.include('r');
    });

    it('POST /api/beyond-sub-topics should create a new dynamic sub-topic', async () => {
      const res = await request(app)
        .post('/api/beyond-sub-topics')
        .send({
          pillarKey: 'programming_tools',
          key: 'julia_lang',
          label: '🟣 Julia for Scientific Computing',
          description: 'High performance statistics in Julia',
          icon: '🟣'
        });
      expect(res.status).to.equal(201);
      expect(res.body.data.key).to.equal('julia_lang');
    });

    it('PATCH /api/beyond-sub-topics/:key should update a sub-topic', async () => {
      const res = await request(app)
        .patch('/api/beyond-sub-topics/julia_lang')
        .send({ label: '🟣 Julia Data Science' });
      expect(res.status).to.equal(200);
      expect(res.body.data.label).to.equal('🟣 Julia Data Science');
    });

    it('DELETE /api/beyond-sub-topics/:key should remove a sub-topic', async () => {
      const res = await request(app).delete('/api/beyond-sub-topics/julia_lang');
      expect(res.status).to.equal(200);
      expect(res.body.data.key).to.equal('julia_lang');
    });
  });
});
