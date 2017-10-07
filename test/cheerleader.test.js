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
  expectedCall = mockAchievement('Pom-pom girl', 'Merci pour tes encouragements %USER% !');
});

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
});

test('counter goes up when user says !gg', (done) => {
  postMessage(app, '!gg')
    .then(() => {
      expect(storage.getItemSync('Pom-pom girl')).toEqual({ someone: 1 });
      return postMessage(app, '!gg encore');
    })
    .then(() => {
      expect(storage.getItemSync('Pom-pom girl')).toEqual({ someone: 2 });
      expect(expectedCall.isDone()).toBe(false);
      expect(userHasAchievement(storage, 'cheerleader')).toBeFalsy();
      done();
    });
});

test('achievement showed on 5th !gg', (done) => {
  storage.setItemSync('Pom-pom girl', { someone: 4 });
  postMessage(app, '!gg')
    .then(() => {
      expectedCall.done();
      expect(userHasAchievement(storage, 'cheerleader')).toBeTruthy();
      done();
    });
});

test('achievement not showed on 6th !gg', (done) => {
  storage.setItemSync('Pom-pom girl', { someone: 5 });
  postMessage(app, '!gg')
    .then(() => {
      expect(expectedCall.isDone()).toBe(false);
      done();
    });
});
