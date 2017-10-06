const nock = require('nock');
const httpServer = require('../httpServer');
const initTestStorage = require('./util/initTestStorage');
const postMessage = require('./util/postMessage');
const mockAchievement = require('./util/mockAchievement');

let storage;
let app;
let achievementMock;

const achievementEntry = { username: 'someone', achievement: 'Suédois LV1' };

beforeEach(() => {
  storage = initTestStorage();
  app = httpServer(storage);
  achievementMock = mockAchievement('Suédois LV1', 'Hej %USER% !');
});

afterEach(() => {
  nock.cleanAll();
});

test('give achievement when user says Hej', (done) => {
  postMessage(app, 'Hej !')
    .then((response) => {
      expect(response.statusCode).toBe(200);
      achievementMock.done();
      expect(storage.getItemSync('achievements')).toEqual([achievementEntry]);
      done();
    });
});

test('dont give achievement twice when user says Hej twice', (done) => {
  postMessage(app, 'Hej !')
    .then((response1) => {
      expect(response1.statusCode).toBe(200);
      achievementMock.done();
      achievementMock = mockAchievement('Suédois LV1', 'Hej %USER% !');
      return postMessage(app, 'hej');
    })
    .then((response2) => {
      expect(response2.statusCode).toBe(200);
      expect(achievementMock.isDone()).toBe(false);
      done();
    });
});

test('dont give achievement if user already has it', (done) => {
  storage.setItemSync('achievements', [achievementEntry]);
  postMessage(app, 'Hej !')
    .then((response) => {
      expect(response.statusCode).toBe(200);
      expect(achievementMock.isDone()).toBe(false);
      done();
    });
});
