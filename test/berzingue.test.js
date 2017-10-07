const nock = require('nock');
const initApp = require('./util/initApp');
const postMessage = require('./util/postMessage');
const mockAchievement = require('./util/mockAchievement');
const userHasAchievement = require('./util/userHasAchievement');

let storage;
let app;
let expectedCall;
const code = 'berzingue';

beforeEach(() => {
  ({ storage, app } = initApp());
  expectedCall = mockAchievement('Berzingos', 'L\'esprit de la berzingue est avec %USER% !');
});

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
});

test('counter goes up when user says !berzingue', (done) => {
  postMessage(app, '!berzingue')
    .then(() => {
      expect(storage.getItemSync(code)).toEqual({ someone: 1 });
      return postMessage(app, '!berzingue encore');
    })
    .then(() => {
      expect(storage.getItemSync(code)).toEqual({ someone: 2 });
      expect(expectedCall.isDone()).toBe(false);
      expect(userHasAchievement(storage, code)).toBeFalsy();
      done();
    });
});

test('achievement showed on 5th !berzingue', (done) => {
  storage.setItemSync(code, { someone: 4 });
  postMessage(app, '!berzingue')
    .then(() => {
      expectedCall.done();
      expect(userHasAchievement(storage, code)).toBeTruthy();
      done();
    });
});

test('achievement not showed on 6th !berzingue', (done) => {
  storage.setItemSync(code, { someone: 5 });
  postMessage(app, '!berzingue')
    .then(() => {
      expect(expectedCall.isDone()).toBe(false);
      done();
    });
});
