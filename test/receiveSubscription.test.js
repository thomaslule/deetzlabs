const nock = require('nock');
const request = require('supertest');
const mockAchievement = require('./util/mockAchievement');
const userHasAchievement = require('./util/userHasAchievement');
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

test('achievement benefactor on sub', (done) => {
  const expectedCall = mockAchievement('Mécène', 'Cool ! Merci pour ton soutien %USER%');
  request(app)
    .post('/api/subscribe')
    .send({
      viewer: 'someone',
      displayName: 'Someone',
      methods: { prime: false, plan: 1000, planName: 'some plan' },
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

test('dont crash on resub', () =>
  request(app)
    .post('/api/resub')
    .send({
      viewer: 'someone',
      months: 6,
      methods: { prime: false, plan: 1000, planName: 'some plan' },
      message: 'hey!',
    })
    .expect(200));
