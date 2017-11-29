const request = require('supertest');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');
const deleteData = require('./util/deleteData');
const closeDbConnection = require('./util/closeDbConnection');

let app;
let db;

beforeAll(async () => { db = await connectToDb(); });

beforeEach(async () => { app = await initApp(db); });

afterEach(() => deleteData(db));

afterAll(() => closeDbConnection(db));

test('can change followers goal template and amount', async () => {
  const newSettings = { goal: 33, html: '<p>some html</p>', css: 'p {color: red}' };
  await request(app).post('/api/change_followers_goal').send(newSettings);
  const received = await request(app).get('/api/followers_goal').expect(200);
  expect(received.body).toEqual(newSettings);
});
