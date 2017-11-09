const nock = require('nock');
const request = require('supertest');
const mockAchievement = require('./util/mockAchievement');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');

let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => initApp(db).then((res) => { app = res; }));

afterEach(() => {
  nock.cleanAll();
  return db.dropDatabase();
});

afterAll(() => db.close(true));

const getVolume = () => request(app).get('/api/alert_volume').expect(200);

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
