const nock = require('nock');
const initApp = require('./util/initApp');
const postMessage = require('./util/postMessage');
const mockAchievement = require('./util/mockAchievement');
const userHasAchievement = require('./util/userHasAchievement');

let storage;
let app;
let expectedCall;

beforeEach(() => {
  ({ storage, app } = initApp());
  expectedCall = mockAchievement('Ambianceuse', 'Bim plein de messages dans le chat, gg %USER%');
});

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
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
      return userHasAchievement(app, 'entertainer');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeFalsy();
      done();
    });
});

test('achievement showed on 300th message', (done) => {
  storage.setItemSync('count_messages', { someone: 299 });
  postMessage(app, 'bim')
    .then(() => {
      expectedCall.done();
      return userHasAchievement(app, 'entertainer');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeTruthy();
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
