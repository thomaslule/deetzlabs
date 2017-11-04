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
  expectedCall = mockAchievement('Fossoyeuse', '%USER% est un peu sadique...');
});

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
});

test('counter goes up when user says !rip', (done) => {
  postMessage(app, '!rip')
    .then(() => {
      expect(storage.getItemSync('gravedigger')).toEqual({ someone: 1 });
      return postMessage(app, '!rip encore');
    })
    .then(() => {
      expect(storage.getItemSync('gravedigger')).toEqual({ someone: 2 });
      expect(expectedCall.isDone()).toBe(false);
      return userHasAchievement(app, 'gravedigger');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeFalsy();
      done();
    });
});

test('achievement showed on 5th !rip', (done) => {
  storage.setItemSync('gravedigger', { someone: 4 });
  postMessage(app, '!rip')
    .then(() => {
      expectedCall.done();
      return userHasAchievement(app, 'gravedigger');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeTruthy();
      done();
    });
});

test('achievement not showed on 6th !rip', (done) => {
  storage.setItemSync('gravedigger', { someone: 5 });
  postMessage(app, '!rip')
    .then(() => {
      expect(expectedCall.isDone()).toBe(false);
      done();
    });
});

test('counter doesnt move if user says something else', (done) => {
  storage.setItemSync('gravedigger', { someone: 4 });
  postMessage(app, 'something else')
    .then(() => {
      expect(storage.getItemSync('gravedigger')).toEqual({ someone: 4 });
      expect(expectedCall.isDone()).toBe(false);
      done();
    });
});
