const nock = require('nock');
const request = require('supertest');
const initApp = require('./util/initApp');
const mockAchievement = require('./util/mockAchievement');

let storage;
let app;

const getVolume = () => request(app).get('/api/alert_volume').expect(200);

beforeEach(() => {
  ({ storage, app } = initApp());
});

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
});

test('volume modified on POST /alert_volume', (done) => {
  const expectedCall = mockAchievement('Testeuse', '%USER% bidouille des trucs', 'Berzingator2000', '0.8');
  request(app)
    .post('/api/alert_volume')
    .send({ volume: '0.8' })
    .expect(200)
    .then(() => request(app).post('/api/test').expect(200))
    .then(() => {
      expectedCall.done();
      done();
    });
});

test('if never set volume is 0.5', (done) => {
  const expectedCall = mockAchievement('Testeuse', '%USER% bidouille des trucs', 'Berzingator2000', '0.5');
  request(app).post('/api/test').expect(200)
    .then(() => {
      expectedCall.done();
      done();
    });
});

test('GET /alert_volume works', (done) => {
  getVolume()
    .then((response) => {
      expect(response.body.volume).toBe('0.5');
      return request(app).post('/api/alert_volume').send({ volume: '0.8' });
    })
    .then(getVolume)
    .then((response) => {
      expect(response.body.volume).toBe('0.8');
      done();
    });
});
