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

test('post to /test shows achievement', (done) => {
  const expectedCall = mockAchievement('Testeuse', '%USER% bidouille des trucs', 'Berzingator2000');
  request(app)
    .post('/api/test')
    .expect(200)
    .then(() => {
      expectedCall.done();
      done();
    });
});
