const request = require('supertest');

module.exports = (
  app,
  achievement,
  expectedCode = 200,
  viewer = 'someone',
  displayName = 'Someone',
) =>
  request(app)
    .post('/api/give_achievement')
    .send({
      viewer,
      displayName,
      achievement,
    })
    .expect(expectedCode);
