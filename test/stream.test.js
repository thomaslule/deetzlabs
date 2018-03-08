const request = require('supertest');
const nock = require('nock');
const App = require('../src/app');

let app;
beforeEach(() => { app = App(); });
afterEach(() => { nock.cleanAll(); });

const begin = () => request(app)
  .post('/stream_begins').send({ game: 'Tetris' });

const changeToMario = () => request(app)
  .post('/stream_change_game').send({ game: 'Mario' });

const changeToTetris = () => request(app)
  .post('/stream_change_game').send({ game: 'Tetris' });

const end = () => request(app)
  .post('/stream_ends');

test('cant begin or end stream twice', () =>
  end().expect(400)
    .then(() => begin().expect(200))
    .then(() => begin().expect(400))
    .then(() => end().expect(200))
    .then(() => end().expect(400)));

test('cant change for same game', async () => {
  await begin().expect(200);
  await changeToTetris().expect(400);
  await changeToMario().expect(200);
  await changeToMario().expect(400);
  await end().expect(200);
});
