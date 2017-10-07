const nock = require('nock');

module.exports = (achievement, text, username = 'Someone', volume = '0.5') => (
  nock('http://localhost:3103')
    .post('/achievement', {
      achievement,
      text,
      username,
      volume,
    })
    .reply(200)
);
