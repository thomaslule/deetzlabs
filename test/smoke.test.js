const request = require('supertest');
const initApp = require('./util/initApp');

test('server responds to health check', () => {
  const { app } = initApp();
  return request(app)
    .get('/api/ping')
    .expect(200);
});
