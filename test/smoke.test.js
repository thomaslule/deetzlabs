const request = require('supertest');
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

test('server responds to health check', () => request(app)
  .get('/api/ping')
  .expect(200));
