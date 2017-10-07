const nock = require('nock');

module.exports = (achievement, text, username = 'Someone') => (
  nock('http://localhost:3103')
    .post('/achievement', {
      achievement,
      text,
      username,
    })
    .reply(200)
);
