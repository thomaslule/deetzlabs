const nock = require('nock');
const request = require('supertest');
const httpServer = require('../httpServer');
const initTestStorage = require('./util/initTestStorage');
const mockAchievement = require('./util/mockAchievement');
const userHasAchievement = require('./util/userHasAchievement');
const postAchievement = require('./util/postAchievement');

let storage;
let app;

beforeEach(() => {
  storage = initTestStorage();
  app = httpServer(storage);
});

afterEach(() => {
  nock.cleanAll();
});

test('post to /achievement gives it to user', (done) => {
  const expectedCall = mockAchievement('Mécène', 'Cool ! Merci pour ton soutien %USER%');
  postAchievement(app, 'Mécène')
    .then(() => {
      expectedCall.done();
      expect(userHasAchievement(storage, 'Mécène')).toBeTruthy();
      done();
    });
});
