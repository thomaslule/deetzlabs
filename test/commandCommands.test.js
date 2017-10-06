const nock = require('nock');
const httpServer = require('../httpServer');
const initTestStorage = require('./util/initTestStorage');
const postMessage = require('./util/postMessage');
const mockSay = require('./util/mockSay');

let storage;
let app;

beforeEach(() => {
  storage = initTestStorage();
  app = httpServer(storage);
});

afterEach(() => {
  nock.cleanAll();
});

test('send its commands if someone type !commands', (done) => {
  const expectedCall = mockSay('Moi j\'ai qu\'une commande c\'est !succès');
  postMessage(app, '!commands')
    .then(() => {
      expectedCall.done();
      done();
    });
});

test('doesnt send anything if its !commands followed by something', (done) => {
  const expectedCall = mockSay('Moi j\'ai qu\'une commande c\'est !succès');
  postMessage(app, '!commands add truc bidule')
    .then(() => {
      expect(expectedCall.isDone()).toBeFalsy();
      done();
    });
});
