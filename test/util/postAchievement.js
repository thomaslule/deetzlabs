const request = require('supertest');

module.exports = (
  app,
  achievement,
  expectedCode = 200,
  user = {
    username: 'someone',
    'display-name': 'Someone',
  },
) =>
  request(app)
    .post('/api/achievement')
    .send({
      user,
      achievement,
    })
    .expect(expectedCode);
