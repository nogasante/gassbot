const { expect } = require('chai');
const { config, validateConfig } = require('../src/config');

describe('Configuration & Brand Identity', () => {
  it('should have official GASS-KNUST brand name and slogan', () => {
    expect(config.brand.name).to.equal('GASS-KNUST');
    expect(config.brand.slogan).to.equal('Statistics for Development');
    expect(config.brand.fullName).to.include('Ghana Association of Statistics Students');
  });

  it('should define accurate brand color palette', () => {
    expect(config.brand.colors.primaryRed).to.equal('#E00613');
    expect(config.brand.colors.skyBlue).to.equal('#4A90E2');
    expect(config.brand.colors.deepTeal).to.equal('#0B536F');
  });

  it('should validate missing required variables when in production', () => {
    const originalEnv = config.env;
    const originalToken = config.botToken;
    const originalDb = config.databaseUrl;

    config.env = 'production';
    config.botToken = '';
    config.databaseUrl = '';

    const validation = validateConfig();
    expect(validation.isValid).to.be.false;
    expect(validation.missing).to.include('BOT_TOKEN');
    expect(validation.missing).to.include('DATABASE_URL');

    // Restore
    config.env = originalEnv;
    config.botToken = originalToken;
    config.databaseUrl = originalDb;
  });
});
