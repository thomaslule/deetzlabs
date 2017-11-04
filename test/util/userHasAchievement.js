const request = require('supertest');

module.exports = (app, achievement) =>
  request(app).get('/api/viewers_achievements')
    .then(res => res.body
      .filter(item => item.username.toLowerCase() === 'someone' && item.achievement.code === achievement)
      .length > 0);
