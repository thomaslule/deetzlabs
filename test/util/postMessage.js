const request = require('supertest');

module.exports = (app, message, displayName = 'Someone', username = 'someone') =>
  request(app)
    .post('/api/chat_message')
    .send({
      user: {
        username,
        'display-name': displayName,
      },
      message,
    })
    .expect(200);
