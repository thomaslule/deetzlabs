const request = require('supertest');

module.exports = (app, achievement, expectedCode = 200) =>
  request(app)
    .post('/api/achievement')
    .send({
      user: {
        username: 'someone',
        'display-name': 'Someone',
      },
      achievement,
    })
    .expect(expectedCode);
