const nock = require('nock');
const httpServer = require('../httpServer');
const initTestStorage = require('./util/initTestStorage');
const postMessage = require('./util/postMessage');
const mockAchievement = require('./util/mockAchievement');
const userHasAchievement = require('./util/userHasAchievement');

let storage;
let app;
let achievementMock;

beforeEach(() => {
  storage = initTestStorage();
  app = httpServer(storage);
  achievementMock = mockAchievement('Suédois LV1', 'Hej %USER% !');
});

afterEach(() => {
  nock.cleanAll();
});

test('give achievement when user says Hej', (done) => {
  postMessage(app, 'Hej !')
    .then(() => {
      achievementMock.done();
      expect(userHasAchievement(storage, 'Suédois LV1')).toBeTruthy();
      done();
    });
});

test('dont give achievement twice when user says Hej twice', (done) => {
  postMessage(app, 'Hej !')
    .then(() => {
      achievementMock.done();
      achievementMock = mockAchievement('Suédois LV1', 'Hej %USER% !');
      return postMessage(app, 'hej');
    })
    .then(() => {
      expect(achievementMock.isDone()).toBe(false);
      done();
    });
});

test('dont give achievement if user already has it', (done) => {
  storage.setItemSync('achievements', [{ username: 'someone', achievement: 'Suédois LV1' }]);
  postMessage(app, 'Hej !')
    .then(() => {
      expect(achievementMock.isDone()).toBe(false);
      done();
    });
});
