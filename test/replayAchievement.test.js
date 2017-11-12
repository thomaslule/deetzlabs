const nock = require('nock');
const request = require('supertest');
const mockAchievement = require('./util/mockAchievement');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');
const deleteData = require('./util/deleteData');
const closeDbConnection = require('./util/closeDbConnection');

let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => initApp(db).then((res) => { app = res; }));

afterEach(() => {
  nock.cleanAll();
  return deleteData(db);
});

afterAll(() => closeDbConnection(db));

test('post to /replay_achievement shows achievement', (done) => {
  const expectedCall = mockAchievement('Suédois LV1', 'Hej %USER% !', 'someone');
  request(app)
    .post('/api/replay_achievement')
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
