const nock = require('nock');

module.exports = message =>
  nock('http://localhost:3102')
    .post('/send_message', {
      message,
    })
    .reply(200);
