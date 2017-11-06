const request = require('supertest');

module.exports = (app, achievement) =>
  request(app).get('/api/viewers_achievements')
    .then(res => res.body.someone !== undefined && res.body.someone.includes(achievement));
