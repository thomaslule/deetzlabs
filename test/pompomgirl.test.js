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
  achievementMock = mockAchievement('Pom-pom girl', 'Merci pour tes encouragements %USER% !');
});

afterEach(() => {
  nock.cleanAll();
});

test('counter goes up when user says !gg', (done) => {
  postMessage(app, '!gg')
    .then(() => {
      expect(storage.getItemSync('Pom-pom girl')).toEqual({ someone: 1 });
      return postMessage(app, '!gg encore');
    })
    .then(() => {
      expect(storage.getItemSync('Pom-pom girl')).toEqual({ someone: 2 });
      expect(achievementMock.isDone()).toBe(false);
      expect(userHasAchievement(storage, 'Pom-pom girl')).toBeFalsy();
      done();
    });
});

test('achievement showed on 5th !gg', (done) => {
  storage.setItemSync('Pom-pom girl', { someone: 4 });
  postMessage(app, '!gg')
    .then(() => {
      achievementMock.done();
      expect(userHasAchievement(storage, 'Pom-pom girl')).toBeTruthy();
      done();
    });
});

test('achievement not showed on 6th !gg', (done) => {
  storage.setItemSync('Pom-pom girl', { someone: 5 });
  postMessage(app, '!gg')
    .then(() => {
      expect(achievementMock.isDone()).toBe(false);
      done();
    });
});
