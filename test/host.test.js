const nock = require('nock');
const request = require('supertest');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');
const deleteData = require('./util/deleteData');
const closeDbConnection = require('./util/closeDbConnection');
const Store = require('../eventStore');

let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => initApp(db).then((res) => { app = res; }));

afterEach(() => {
  nock.cleanAll();
  return deleteData(db);
});

afterAll(() => closeDbConnection(db));

test('host adds event to store', async () => {
  await request(app).post('/api/host').send({ viewer: 'someone', nbViewers: 20 }).expect(200);
  const store = Store(db);
  const events = (await store.get('viewer', 'someone')).map(r => r.event);
  expect(events.length).toBe(1);
  expect(events[0].type).toBe('hosted');
  expect(events[0].nbViewers).toBe(20);
});
