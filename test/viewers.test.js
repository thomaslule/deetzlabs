const nock = require('nock');
const request = require('supertest');
const App = require('../src/app');
const { postMessage } = require('./util');

let app;
beforeEach(() => { app = App(); });
afterEach(() => { nock.cleanAll(); });

const getViewers = () => request(app).get('/viewers').expect(200);

test('remember viewer', (done) => {
  postMessage(app, 'yo', 'Machin', 'machin')
    .then(getViewers)
    .then((response) => {
      expect(response.body.machin).toBe('Machin');
      done();
    });
});

test('remember multiple viewers', (done) => {
  postMessage(app, 'yo', 'Machin', 'machin')
    .then(() => postMessage(app, 'hey', 'Bidule', 'bidule'))
    .then(getViewers)
    .then((response) => {
      expect(response.body.machin).toBe('Machin');
      expect(response.body.bidule).toBe('Bidule');
      done();
    });
});

test('update viewer if capitalization change', (done) => {
  postMessage(app, 'yo', 'Machin', 'machin')
    .then(() => postMessage(app, 'hey', 'MaChIn', 'machin'))
    .then(getViewers)
    .then((response) => {
      expect(response.body.machin).toBe('MaChIn');
      done();
    });
});

test('works with special display name', (done) => {
  postMessage(app, 'yo', '$$$special$$$', 'machin')
    .then(getViewers)
    .then((response) => {
      expect(response.body.machin).toBe('$$$special$$$');
      done();
    });
});

test('works when id = display name', (done) => {
  postMessage(app, 'yo', 'machin', 'machin')
    .then(getViewers)
    .then((response) => {
      expect(response.body.machin).toBe('machin');
      done();
    });
});
