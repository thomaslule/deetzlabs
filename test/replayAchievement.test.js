const nock = require('nock');
const request = require('supertest');
const initApp = require('./util/initApp');
const mockAchievement = require('./util/mockAchievement');

let storage;
let app;

beforeEach(() => {
  ({ storage, app } = initApp());
});

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
});

test('post to /replay_achievement shows achievement', (done) => {
  const expectedCall = mockAchievement('Suédois LV1', 'Hej %USER% !', 'Someone');
  request(app)
    .post('/api/replay_achievement')
    .send({
      achievement: 'swedish',
      username: 'Someone',
    })
    .expect(200)
    .then(() => {
      expectedCall.done();
      done();
    });
});
