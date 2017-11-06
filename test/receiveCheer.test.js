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

beforeEach(() => initApp(db)
  .then((res) => {
    ({ app, storage } = res);
  }));

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
  return db.dropDatabase();
});

afterAll(() => db.close(true));

test('achievement benefactor on first cheer', (done) => {
  const expectedCall = mockAchievement('Mécène', 'Cool ! Merci pour ton soutien %USER%');
  request(app)
    .post('/api/cheer')
    .send({
      displayName: 'Someone',
      amount: 100,
      message: 'hop cheer100',
    })
    .expect(200)
    .then(() => {
      expectedCall.done();
      return userHasAchievement(app, 'Mécène');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeTruthy();
      done();
    });
});
