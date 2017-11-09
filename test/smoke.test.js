const request = require('supertest');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');

let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => initApp(db).then((res) => { app = res; }));

afterEach(() => db.dropDatabase());

afterAll(() => db.close(true));

test('server responds to health check', () => request(app)
  .get('/api/ping')
  .expect(200));
