const request = require('supertest');
const postMessage = require('./util/postMessage');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');

let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => initApp(db).then((res) => { app = res; }));

afterEach(() => db.dropDatabase());

afterAll(() => db.close(true));

const getViewers = () => request(app).get('/api/viewers').expect(200);

test('remember viewer', (done) => {
  postMessage(app, 'yo', 'Machin', 'machin')
    .then(getViewers)
    .then((response) => {
      expect(response.body.machin).toBe('Machin');
      done();
    });
});

test('remember multiple viewers', (done) => {
  postMessage(app, 'yo', 'Machin', 'machin')
    .then(() => postMessage(app, 'hey', 'Bidule', 'bidule'))
    .then(getViewers)
    .then((response) => {
      expect(response.body.machin).toBe('Machin');
      expect(response.body.bidule).toBe('Bidule');
      done();
    });
});

test('update viewer if capitalization change', (done) => {
  postMessage(app, 'yo', 'Machin', 'machin')
    .then(() => postMessage(app, 'hey', 'MaChIn', 'machin'))
    .then(getViewers)
    .then((response) => {
      expect(response.body.machin).toBe('MaChIn');
      done();
    });
});

test('works with special display name', (done) => {
  postMessage(app, 'yo', '$$$special$$$', 'machin')
    .then(getViewers)
    .then((response) => {
      expect(response.body.machin).toBe('$$$special$$$');
      done();
    });
});
