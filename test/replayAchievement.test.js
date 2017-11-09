const nock = require('nock');
const request = require('supertest');
const mockAchievement = require('./util/mockAchievement');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');

let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => initApp(db).then((res) => { app = res; }));

afterEach(() => {
  nock.cleanAll();
  return db.dropDatabase();
});

afterAll(() => db.close(true));

test('post to /replay_achievement shows achievement', (done) => {
  const expectedCall = mockAchievement('Suédois LV1', 'Hej %USER% !', 'someone');
  request(app)
    .post('/api/replay_achievement')
    .send({
      achievement: 'Suédois LV1',
      viewer: 'someone',
    })
    .expect(200)
    .then(() => {
      expectedCall.done();
      done();
    });
});
