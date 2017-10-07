const nock = require('nock');
const initApp = require('./util/initApp');
const postMessage = require('./util/postMessage');
const mockSay = require('./util/mockSay');

let app;
let storage;

beforeEach(() => {
  ({ app, storage } = initApp());
});

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
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
