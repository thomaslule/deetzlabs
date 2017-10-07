const nock = require('nock');
const request = require('supertest');
const initApp = require('./util/initApp');
const mockAchievement = require('./util/mockAchievement');

let storage;
let app;

beforeEach(() => {
  ({ storage, app } = initApp());
});

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
});

test('post to /test shows achievement', (done) => {
  const expectedCall = mockAchievement('Testeuse', '%USER% bidouille des trucs', 'Berzingator2000');
  request(app)
    .post('/api/test')
    .expect(200)
    .then(() => {
      expectedCall.done();
      done();
    });
});
