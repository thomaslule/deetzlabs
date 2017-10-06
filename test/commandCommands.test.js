const nock = require('nock');
const httpServer = require('../httpServer');
const initTestStorage = require('./util/initTestStorage');
const postMessage = require('./util/postMessage');

let storage;
let app;

const mockSendCommands = () =>
  nock('http://localhost:3102')
    .post('/send_message', {
      message: 'Moi j\'ai qu\'une commande c\'est !succès',
    })
    .reply(200);

beforeEach(() => {
  storage = initTestStorage();
  app = httpServer(storage);
});

afterEach(() => {
  nock.cleanAll();
});

test('send its commands if someone type !commands', (done) => {
  const expectedCall = mockSendCommands();
  postMessage(app, '!commands')
    .then(() => {
      expectedCall.done();
      done();
    });
});

test('doesnt send anything if its !commands followed by something', (done) => {
  const expectedCall = mockSendCommands();
  postMessage(app, '!commands add truc bidule')
    .then(() => {
      expect(expectedCall.isDone()).toBeFalsy();
      done();
    });
});
