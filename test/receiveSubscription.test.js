const nock = require('nock');
const request = require('supertest');
const initApp = require('./util/initApp');
const mockAchievement = require('./util/mockAchievement');
const userHasAchievement = require('./util/userHasAchievement');

let storage;
let app;

beforeEach(() => {
  ({ storage, app } = initApp());
});

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
});

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
