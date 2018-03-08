const request = require('supertest');
const nock = require('nock');
const App = require('../src/app');
const { mockAllAchievements, postMessage } = require('./util');

let app;
beforeEach(() => { app = App(); });
afterEach(() => { nock.cleanAll(); });

test('get the credits with GET /credits', async () => {
  mockAllAchievements();
  await request(app).post('/stream_begins').send({ game: 'Tetris' });
  await postMessage(app, 'yo');
  await request(app).post('/cheer').send({
    viewer: 'someone',
    displayName: 'Someone',
    amount: 100,
    message: 'hop cheer100',
  });

  await request(app).get('/credits').expect(200, {
    games: ['Tetris'],
    viewers: ['Someone'],
    hosts: [],
    achievements: [{ viewer: 'Someone', achievement: 'Mécène' }],
    subscribes: [],
    donators: ['Someone'],
    follows: [],
  });
});
