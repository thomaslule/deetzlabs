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

const join = () => request(app)
  .post('/api/join')
  .send({ viewer: 'someone' });

const leave = () => request(app)
  .post('/api/leave')
  .send({ viewer: 'someone' });

test('cant join or leave twice', () =>
  leave().expect(400)
    .then(() => join().expect(200))
    .then(() => join().expect(400))
    .then(() => leave().expect(200))
    .then(() => leave().expect(400)));
