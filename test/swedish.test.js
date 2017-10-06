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
  expectedCall = mockAchievement('Suédois LV1', 'Hej %USER% !');
});

afterEach(() => {
  nock.cleanAll();
});

test('give achievement when user says Hej', (done) => {
  postMessage(app, 'Hej !')
    .then(() => {
      expectedCall.done();
      expect(userHasAchievement(storage, 'Suédois LV1')).toBeTruthy();
      done();
    });
});

test('dont give achievement twice when user says Hej twice', (done) => {
  postMessage(app, 'Hej !')
    .then(() => {
      expectedCall.done();
      expectedCall = mockAchievement('Suédois LV1', 'Hej %USER% !');
      return postMessage(app, 'hej');
    })
    .then(() => {
      expect(expectedCall.isDone()).toBe(false);
      done();
    });
});

test('dont give achievement if user already has it', (done) => {
  storage.setItemSync('achievements', [{ username: 'someone', achievement: 'Suédois LV1' }]);
  postMessage(app, 'Hej !')
    .then(() => {
      expect(expectedCall.isDone()).toBe(false);
      done();
    });
});
