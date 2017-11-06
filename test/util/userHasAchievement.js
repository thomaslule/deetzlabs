const request = require('supertest');

module.exports = (app, achievement) =>
  request(app).get('/api/viewers_achievements')
    .then(res => res.body
      .find(a => a.viewer === 'someone' && a.achievement === achievement));
