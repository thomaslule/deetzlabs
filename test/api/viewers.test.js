const request = require('supertest');
const { setup, postMessage } = require('./util');

let app; let closet;
beforeEach(() => {
  ({ app, closet } = setup());
});

const getViewers = () => request(app).get('/api/viewers').expect(200);

test('remember viewer', (done) => {
  postMessage(closet, 'yo', 'Machin', 'machin')
    .then(getViewers)
    .then((response) => {
      expect(response.body.machin).toBe('Machin');
      done();
    });
});

test('remember multiple viewers', (done) => {
  postMessage(closet, 'yo', 'Machin', 'machin')
    .then(() => postMessage(closet, 'hey', 'Bidule', 'bidule'))
    .then(getViewers)
    .then((response) => {
      expect(response.body.machin).toBe('Machin');
      expect(response.body.bidule).toBe('Bidule');
      done();
    });
});

test('update viewer if capitalization change', (done) => {
  postMessage(closet, 'yo', 'Machin', 'machin')
    .then(() => postMessage(closet, 'hey', 'MaChIn', 'machin'))
    .then(getViewers)
    .then((response) => {
      expect(response.body.machin).toBe('MaChIn');
      done();
    });
});

test('works with special display name', (done) => {
  postMessage(closet, 'yo', '$$$special$$$', 'machin')
    .then(getViewers)
    .then((response) => {
      expect(response.body.machin).toBe('$$$special$$$');
      done();
    });
});

test('works when id = display name', (done) => {
  postMessage(closet, 'yo', 'machin', 'machin')
    .then(getViewers)
    .then((response) => {
      expect(response.body.machin).toBe('machin');
      done();
    });
});
