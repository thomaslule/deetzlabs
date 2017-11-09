const nock = require('nock');
const request = require('supertest');
const mockAchievement = require('./util/mockAchievement');
const userHasAchievement = require('./util/userHasAchievement');
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
      return userHasAchievement(app, 'Mécène');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeTruthy();
      done();
    });
});
