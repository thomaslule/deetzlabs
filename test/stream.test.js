const request = require('supertest');
const nock = require('nock');
const App = require('../src/app');
const { beginStream, endStream } = require('./util');

let app;
beforeEach(() => { app = App(); });
afterEach(() => { nock.cleanAll(); });

const changeToMario = () => request(app)
  .post('/stream_change_game').send({ game: 'Mario' });

const changeToTetris = () => request(app)
  .post('/stream_change_game').send({ game: 'Tetris' });

test('cant begin or end stream twice', () =>
  endStream(app).expect(400)
    .then(() => beginStream(app).expect(200))
    .then(() => beginStream(app).expect(400))
    .then(() => endStream(app).expect(200))
    .then(() => endStream(app).expect(400)));

test('cant change for same game', async () => {
  await beginStream(app).expect(200);
  await changeToTetris().expect(400);
  await changeToMario().expect(200);
  await changeToMario().expect(400);
  await endStream(app).expect(200);
});
