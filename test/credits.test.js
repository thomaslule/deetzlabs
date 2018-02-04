const nock = require('nock');
const request = require('supertest');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');
const deleteData = require('./util/deleteData');
const closeDbConnection = require('./util/closeDbConnection');
const postMessage = require('./util/postMessage');
const mockAllShowAchievements = require('./util/mockAllShowAchievements');

let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => initApp(db).then((res) => { app = res; }));

afterEach(() => {
  nock.cleanAll();
  return deleteData(db);
});

afterAll(() => closeDbConnection(db));

test('get the credits with GET /credits', async () => {
  mockAllShowAchievements();
  await request(app).post('/api/stream_begins').send({ game: 'Tetris' });
  await postMessage(app, 'yo');
  await request(app).post('/api/cheer').send({
    viewer: 'someone',
    displayName: 'Someone',
    amount: 100,
    message: 'hop cheer100',
  });

  await request(app).get('/api/credits').expect(200, {
    games: ['Tetris'],
    viewers: ['Someone'],
    hosts: [],
    achievements: [{ viewer: 'Someone', achievement: 'Mécène' }],
    subscribes: [],
    donators: ['Someone'],
    follows: [],
  });
});
