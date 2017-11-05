const request = require('supertest');
const postMessage = require('./util/postMessage');
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
  storage.clearSync();
  return db.dropDatabase();
});

afterAll(() => db.close(true));

const getViewers = () => request(app).get('/api/viewers').expect(200);

test('remember viewer', (done) => {
  postMessage(app, 'yo', 'Machin')
    .then(getViewers)
    .then((response) => {
      expect(response.body).toContain('Machin');
      done();
    });
});

test('remember multiple viewers', (done) => {
  postMessage(app, 'yo', 'Machin')
    .then(() => postMessage(app, 'hey', 'Bidule'))
    .then(getViewers)
    .then((response) => {
      expect(response.body).toContain('Machin');
      expect(response.body).toContain('Bidule');
      done();
    });
});

test('update viewer if capitalization change', (done) => {
  postMessage(app, 'yo', 'Machin')
    .then(() => postMessage(app, 'hey', 'MaChIn'))
    .then(getViewers)
    .then((response) => {
      expect(response.body.includes('Machin')).toBeFalsy();
      expect(response.body).toContain('MaChIn');
      done();
    });
});
