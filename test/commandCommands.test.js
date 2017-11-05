const nock = require('nock');
const postMessage = require('./util/postMessage');
const mockSay = require('./util/mockSay');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');

let storage;
let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => {
  ({ app, storage } = initApp(db));
});

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
  return db.dropDatabase();
});

afterAll(() => db.close(true));

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
