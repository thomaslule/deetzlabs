const nock = require('nock');
const initApp = require('./util/initApp');
const postMessage = require('./util/postMessage');
const mockAchievement = require('./util/mockAchievement');
const userHasAchievement = require('./util/userHasAchievement');

let storage;
let app;
let expectedCall;
const code = 'careful';

beforeEach(() => {
  ({ storage, app } = initApp());
  expectedCall = mockAchievement('Prudente', '%USER% nous montre la voie de la sagesse');
});

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
});

test('counter goes up when user says !heal or !save', (done) => {
  postMessage(app, '!heal')
    .then(() => {
      expect(storage.getItemSync(code)).toEqual({ someone: 1 });
      return postMessage(app, '!save');
    })
    .then(() => {
      expect(storage.getItemSync(code)).toEqual({ someone: 2 });
      expect(expectedCall.isDone()).toBe(false);
      expect(userHasAchievement(storage, code)).toBeFalsy();
      done();
    });
});

test('achievement showed on 5th !heal / !save', (done) => {
  storage.setItemSync(code, { someone: 4 });
  postMessage(app, '!heal')
    .then(() => {
      expectedCall.done();
      expect(userHasAchievement(storage, code)).toBeTruthy();
      done();
    });
});

test('achievement not showed on 6th !heal / !save', (done) => {
  storage.setItemSync(code, { someone: 5 });
  postMessage(app, '!heal')
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
