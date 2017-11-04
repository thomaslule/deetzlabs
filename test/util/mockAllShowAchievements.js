const nock = require('nock');

module.exports = () => nock('http://localhost:3103')
  .post('/achievement')
  .reply(200)
  .persist();
