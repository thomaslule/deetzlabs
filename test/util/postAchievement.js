const request = require('supertest');

module.exports = (app, achievement) =>
  request(app)
    .post('/api/achievement')
    .send({
      user: {
        username: 'someone',
        'display-name': 'Someone',
      },
      achievement,
    })
    .expect(200);
