const request = require('supertest');

module.exports = (app, message) => request(app)
  .post('/api/chat_message')
  .send({
    user: {
      username: 'someone',
      'display-name': 'Someone',
    },
    message,
  });
