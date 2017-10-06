const nock = require('nock');
const httpServer = require('../httpServer');
const initTestStorage = require('./util/initTestStorage');
const postMessage = require('./util/postMessage');
const mockAchievement = require('./util/mockAchievement');
const userHasAchievement = require('./util/userHasAchievement');

let storage;
let app;
let expectedCall;

beforeEach(() => {
  storage = initTestStorage();
  app = httpServer(storage);
  expectedCall = mockAchievement('Ambianceuse', 'Bim plein de messages dans le chat, gg %USER%');
});

afterEach(() => {
  nock.cleanAll();
});

test('counter goes up when user says something', (done) => {
  postMessage(app, 'hey')
    .then(() => {
      expect(storage.getItemSync('count_messages')).toEqual({ someone: 1 });
      return postMessage(app, 'et hop');
    })
    .then(() => {
      expect(storage.getItemSync('count_messages')).toEqual({ someone: 2 });
      expect(expectedCall.isDone()).toBe(false);
      expect(userHasAchievement(storage, 'Ambianceuse')).toBeFalsy();
      done();
    });
});

test('achievement showed on 300th message', (done) => {
  storage.setItemSync('count_messages', { someone: 299 });
  postMessage(app, 'bim')
    .then(() => {
      expectedCall.done();
      expect(userHasAchievement(storage, 'Ambianceuse')).toBeTruthy();
      done();
    });
});

test('achievement not showed on 301th message', (done) => {
  storage.setItemSync('count_messages', { someone: 300 });
  postMessage(app, 'bim')
    .then(() => {
      expect(expectedCall.isDone()).toBe(false);
      done();
    });
});
