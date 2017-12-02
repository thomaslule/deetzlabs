const nock = require('nock');
const request = require('supertest');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');
const deleteData = require('./util/deleteData');
const closeDbConnection = require('./util/closeDbConnection');

let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => initApp(db).then((res) => { app = res; }));

afterEach(() => {
  nock.cleanAll();
  return deleteData(db);
});

afterAll(() => closeDbConnection(db));

const begin = () => request(app)
  .post('/api/stream_begins');

const end = () => request(app)
  .post('/api/stream_ends');

test('cant begin or end stream twice', () =>
  end().expect(400)
    .then(() => begin().expect(200))
    .then(() => begin().expect(400))
    .then(() => end().expect(200))
    .then(() => end().expect(400)));
