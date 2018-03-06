const nock = require('nock');
const request = require('supertest');
const App = require('../src/app');
const { mockAchievement } = require('./util');

let app;
beforeEach(() => { app = App(); });
afterEach(() => { nock.cleanAll(); });

test('post to /replay_achievement shows achievement', (done) => {
  const expectedCall = mockAchievement('Suédois LV1', 'Hej %USER% !', 'someone');
  request(app)
    .post('/replay_achievement')
    .send({
      achievement: 'swedish',
      viewer: 'someone',
    })
    .expect(200)
    .then(() => {
      expectedCall.done();
      done();
    });
});
