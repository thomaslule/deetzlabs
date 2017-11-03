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

test('achievement benefactor on first cheer', (done) => {
  const expectedCall = mockAchievement('Mécène', 'Cool ! Merci pour ton soutien %USER%');
  request(app)
    .post('/api/cheer')
    .send({
      user: 'Someone',
    })
    .expect(200)
    .then(() => {
      expectedCall.done();
      expect(userHasAchievement(storage, 'benefactor')).toBeTruthy();
      done();
    });
});

test('no achievement if not first cheer', (done) => {
  const expectedCall = mockAchievement('Mécène', 'Cool ! Merci pour ton soutien %USER%');
  storage.setItemSync('achievements', [{ username: 'someone', achievement: 'benefactor' }]);
  request(app)
    .post('/api/cheer')
    .send({
      user: 'Someone',
    })
    .expect(200)
    .then(() => {
      expect(expectedCall.isDone()).toBe(false);
      done();
    });
});
