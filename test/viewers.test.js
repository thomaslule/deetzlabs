const request = require('supertest');
const initApp = require('./util/initApp');
const postMessage = require('./util/postMessage');

let app;

const getViewers = () => request(app).get('/api/viewers').expect(200);

beforeEach(() => {
  ({ app } = initApp());
});

test('remember viewer', (done) => {
  postMessage(app, 'yo', 'Machin')
    .then(getViewers)
    .then((response) => {
      expect(response.body).toContain('Machin');
      done();
    });
});

test('remember multiple viewers', (done) => {
  postMessage(app, 'yo', 'Machin')
    .then(() => postMessage(app, 'hey', 'Bidule'))
    .then(getViewers)
    .then((response) => {
      expect(response.body).toContain('Machin');
      expect(response.body).toContain('Bidule');
      done();
    });
});

test('update viewer if capitalization change', (done) => {
  postMessage(app, 'yo', 'Machin')
    .then(() => postMessage(app, 'hey', 'MaChIn'))
    .then(getViewers)
    .then((response) => {
      expect(response.body.includes('Machin')).toBeFalsy();
      expect(response.body).toContain('MaChIn');
      done();
    });
});
