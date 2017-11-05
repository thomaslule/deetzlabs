const nock = require('nock');
const request = require('supertest');
const mockAchievement = require('./util/mockAchievement');
const userHasAchievement = require('./util/userHasAchievement');
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

test('achievement benefactor on sub', (done) => {
  const expectedCall = mockAchievement('Mécène', 'Cool ! Merci pour ton soutien %USER%');
  request(app)
    .post('/api/subscription')
    .send({
      user: 'Someone',
    })
    .expect(200)
    .then(() => {
      expectedCall.done();
      return userHasAchievement(app, 'benefactor');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeTruthy();
      done();
    });
});
