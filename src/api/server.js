const express = require('express');
const cors = require('cors');
const { webhookCallback } = require('grammy');
const { config } = require('../config');
const { query } = require('../config/database');
const apiRouter = require('./routes/api');

function createServer(bot = null) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Telegram Webhook Endpoint (if bot is provided and webhook is enabled)
  if (bot && config.botMode === 'webhook') {
    app.use(config.webhookPath, webhookCallback(bot, 'express'));
  }

  // Health Check Endpoint
  app.get('/health', async (req, res) => {
    let dbStatus = 'disconnected';
    try {
      if (config.databaseUrl) {
        await query('SELECT 1;');
        dbStatus = 'connected';
      } else {
        dbStatus = 'not_configured';
      }
    } catch (err) {
      dbStatus = `error: ${err.message}`;
    }

    return res.json({
      status: 'ok',
      service: config.brand.name,
      slogan: config.brand.slogan,
      mode: config.botMode,
      environment: config.env,
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Mount API
  app.use('/api', apiRouter);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
  });

  // Central Error Handler
  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  });

  return app;
}

module.exports = {
  createServer
};
