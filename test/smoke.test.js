const request = require('supertest');
const httpServer = require('../httpServer');

test('server responds to health check', () => {
  const app = httpServer();
  return request(app)
    .get('/api/ping')
    .expect(200);
});
