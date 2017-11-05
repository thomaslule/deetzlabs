const nock = require('nock');
const request = require('supertest');
const mockAchievement = require('./util/mockAchievement');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');

let storage;
let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => {
  ({ app, storage } = initApp(db));
});

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
  return db.dropDatabase();
});

afterAll(() => db.close(true));

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
