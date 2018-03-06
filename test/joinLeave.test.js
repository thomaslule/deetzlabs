const nock = require('nock');
const request = require('supertest');
const App = require('../src/app');

let app;
beforeEach(() => { app = App(); });
afterEach(() => { nock.cleanAll(); });

const join = () => request(app)
  .post('/join')
  .send({ viewer: 'someone' });

const leave = () => request(app)
  .post('/leave')
  .send({ viewer: 'someone' });

test('cant join or leave twice', () =>
  leave().expect(400)
    .then(() => join().expect(200))
    .then(() => join().expect(400))
    .then(() => leave().expect(200))
    .then(() => leave().expect(400)));
