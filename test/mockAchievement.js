const nock = require('nock');

module.exports = (achievement, text) => (
  nock('http://localhost:3103')
    .post('/achievement', {
      achievement,
      text,
      username: 'Someone',
    })
    .reply(200)
);
