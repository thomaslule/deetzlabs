const request = require('supertest');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');
const closeDbConnection = require('./util/closeDbConnection');
const deleteData = require('./util/deleteData');

let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => initApp(db).then((res) => { app = res; }));

afterEach(() => deleteData(db));

afterAll(() => closeDbConnection(db));

test('server responds to health check', () => request(app)
  .get('/api/ping')
  .expect(200));
