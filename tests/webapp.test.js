const { expect } = require('chai');
const request = require('supertest');
const crypto = require('crypto');
const { createServer } = require('../src/api/server');
const { validateTelegramWebAppData } = require('../src/api/middleware/telegramAuth');

describe('Student Mini WebApp & Telegram Integration', () => {
  let app;
  const testToken = '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ';

  before(() => {
    app = createServer();
  });

  describe('Static WebApp Asset Serving', () => {
    it('should serve index.html at root (/)', async () => {
      const res = await request(app).get('/');
      expect(res.status).to.equal(200);
      expect(res.text).to.include('GASS-KNUST Student Portal');
      expect(res.text).to.include('telegram-web-app.js');
    });

    it('should serve index.html at /portal for SPA deep linking', async () => {
      const res = await request(app).get('/portal');
      expect(res.status).to.equal(200);
      expect(res.text).to.include('GASS-KNUST Student Portal');
    });

    it('should serve brand CSS variables', async () => {
      const res = await request(app).get('/css/variables.css');
      expect(res.status).to.equal(200);
      expect(res.text).to.include('--gass-red: #E00613');
      expect(res.text).to.include('--gass-blue: #4A90E2');
      expect(res.text).to.include('--gass-teal: #0B536F');
    });

    it('should serve client application scripts', async () => {
      const res = await request(app).get('/js/app.js');
      expect(res.status).to.equal(200);
      expect(res.text).to.include('App');
    });
  });

  describe('Telegram WebApp HMAC-SHA256 Authentication', () => {
    function generateValidInitData(userObj, token) {
      const authDate = Math.floor(Date.now() / 1000).toString();
      const userStr = JSON.stringify(userObj);
      const queryId = 'AAHdF6IQAAAAAN0XohDhrOrc';

      const dataMap = {
        auth_date: authDate,
        query_id: queryId,
        user: userStr
      };

      const dataCheckArr = Object.keys(dataMap)
        .sort()
        .map(key => `${key}=${dataMap[key]}`);
      const dataCheckString = dataCheckArr.join('\n');

      const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
      const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

      const params = new URLSearchParams({
        query_id: queryId,
        user: userStr,
        auth_date: authDate,
        hash
      });

      return params.toString();
    }

    it('should validate correctly signed Telegram initData', () => {
      const user = { id: 77712345, first_name: 'Kwame', username: 'kwame_stats' };
      const validInitData = generateValidInitData(user, testToken);

      const parsed = validateTelegramWebAppData(validInitData, testToken);
      expect(parsed).to.not.be.null;
      expect(parsed.id).to.equal(77712345);
      expect(parsed.first_name).to.equal('Kwame');
    });

    it('should reject tampered or invalid Telegram initData', () => {
      const tampered = 'user={"id":123}&hash=invalid_hash_value';
      const parsed = validateTelegramWebAppData(tampered, testToken);
      expect(parsed).to.be.null;
    });

    it('should reject empty or missing initData on /api/auth/telegram with 400', async () => {
      const res = await request(app)
        .post('/api/auth/telegram')
        .send({});
      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
    });

    it('should reject forged initData on /api/auth/telegram with 401', async () => {
      const res = await request(app)
        .post('/api/auth/telegram')
        .send({ initData: 'query_id=fake&hash=badhash123' });
      expect(res.status).to.equal(401);
      expect(res.body.success).to.be.false;
    });
  });
});
