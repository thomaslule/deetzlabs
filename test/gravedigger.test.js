const nock = require('nock');
const httpServer = require('../httpServer');
const initTestStorage = require('./initTestStorage');
const postMessage = require('./postMessage');
const mockAchievement = require('./mockAchievement');

let storage;
let app;
let achievementMock;

beforeEach(() => {
  storage = initTestStorage();
  app = httpServer(storage);
  achievementMock = mockAchievement('Fossoyeuse', '%USER% est un peu sadique...');
});

afterEach(() => {
  nock.cleanAll();
});

test('counter goes up when user says !rip', (done) => {
  postMessage(app, '!rip')
    .then(() => {
      expect(storage.getItemSync('gravedigger')).toEqual({ someone: 1 });
      return postMessage(app, '!rip encore');
    })
    .then(() => {
      expect(storage.getItemSync('gravedigger')).toEqual({ someone: 2 });
      expect(achievementMock.isDone()).toBe(false);
      done();
    });
});

test('achievement showed on 5th !rip', (done) => {
  storage.setItemSync('gravedigger', { someone: 4 });
  postMessage(app, '!rip')
    .then(() => {
      achievementMock.done();
      done();
    });
});

test('achievement not showed on 6th !rip', (done) => {
  storage.setItemSync('gravedigger', { someone: 5 });
  postMessage(app, '!rip')
    .then(() => {
      expect(achievementMock.isDone()).toBe(false);
      done();
    });
});
