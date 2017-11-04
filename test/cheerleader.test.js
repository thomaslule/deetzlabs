const nock = require('nock');
const initApp = require('./util/initApp');
const postMessage = require('./util/postMessage');
const mockAchievement = require('./util/mockAchievement');
const userHasAchievement = require('./util/userHasAchievement');

let storage;
let app;
let expectedCall;
const code = 'cheerleader';

beforeEach(() => {
  ({ storage, app } = initApp());
  expectedCall = mockAchievement('Pom-pom girl', 'Merci pour tes encouragements %USER% !');
});

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
});

test('counter goes up when user says !gg', (done) => {
  postMessage(app, '!gg')
    .then(() => {
      expect(storage.getItemSync(code)).toEqual({ someone: 1 });
      return postMessage(app, '!gg encore');
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

test('achievement showed on 5th !gg', (done) => {
  storage.setItemSync(code, { someone: 4 });
  postMessage(app, '!gg')
    .then(() => {
      expectedCall.done();
      return userHasAchievement(app, code);
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeTruthy();
      done();
    });
});

test('achievement not showed on 6th !gg', (done) => {
  storage.setItemSync(code, { someone: 5 });
  postMessage(app, '!gg')
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
