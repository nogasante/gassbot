const { expect } = require('chai');
const http = require('http');
const { startKeepAlive } = require('../src/utils/keepAlive');

describe('Keep-Alive Service (Render 24/7 Availability)', () => {
  let server;
  let serverPort;
  let pingCount = 0;

  before((done) => {
    server = http.createServer((req, res) => {
      if (req.url === '/health') {
        pingCount++;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    server.listen(0, () => {
      serverPort = server.address().port;
      done();
    });
  });

  after((done) => {
    server.close(done);
  });

  it('should return null when no target url or environment is configured', () => {
    const service = startKeepAlive({ url: null });
    expect(service).to.be.null;
  });

  it('should ping the target url and execute stop cleanly', (done) => {
    const service = startKeepAlive({
      url: `http://localhost:${serverPort}/health`,
      intervalMs: 100,
      initialDelayMs: 50
    });

    expect(service).to.exist;
    expect(service.stop).to.be.a('function');

    setTimeout(() => {
      expect(pingCount).to.be.at.least(1);
      service.stop();
      const currentCount = pingCount;

      setTimeout(() => {
        expect(pingCount).to.equal(currentCount);
        done();
      }, 150);
    }, 200);
  });
});
