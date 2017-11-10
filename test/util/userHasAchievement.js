const request = require('supertest');

module.exports = (app, achievement) =>
  request(app).get('/api/all_viewer_achievements')
    .then(res => res.body
      .find(a => a.viewer === 'someone' && a.achievement === achievement));
