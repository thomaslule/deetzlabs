const nock = require('nock');
const initApp = require('./util/initApp');
const postMessage = require('./util/postMessage');
const mockAchievement = require('./util/mockAchievement');
const userHasAchievement = require('./util/userHasAchievement');

let storage;
let app;
let expectedCall;
const code = 'vigilante';

beforeEach(() => {
  ({ storage, app } = initApp());
  expectedCall = mockAchievement('Vigilance constante', '%USER% ne laisse rien passer !');
});

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
});

test('counter goes up when user says !putain', (done) => {
  postMessage(app, '!putain')
    .then(() => {
      expect(storage.getItemSync(code)).toEqual({ someone: 1 });
      return postMessage(app, '!putain encore');
    })
    .then(() => {
      expect(storage.getItemSync(code)).toEqual({ someone: 2 });
      expect(expectedCall.isDone()).toBe(false);
      return userHasAchievement(app, code);
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeFalsy();
      done();
    });
});

test('achievement showed on 5th !putain', (done) => {
  storage.setItemSync(code, { someone: 4 });
  postMessage(app, '!putain')
    .then(() => {
      expectedCall.done();
      return userHasAchievement(app, code);
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeTruthy();
      done();
    });
});

test('achievement not showed on 6th !putain', (done) => {
  storage.setItemSync(code, { someone: 5 });
  postMessage(app, '!putain')
    .then(() => {
      expect(expectedCall.isDone()).toBe(false);
      done();
    });
});

test('counter doesnt move if user says something else', (done) => {
  storage.setItemSync(code, { someone: 4 });
  postMessage(app, 'something else')
    .then(() => {
      expect(storage.getItemSync(code)).toEqual({ someone: 4 });
      expect(expectedCall.isDone()).toBe(false);
      done();
    });
});
