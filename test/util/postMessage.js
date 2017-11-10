const request = require('supertest');

module.exports = (app, message, displayName = 'Someone', viewer = 'someone') =>
  request(app)
    .post('/api/send_chat_message')
    .send({
      viewer,
      displayName,
      message,
    })
    .expect(200);
