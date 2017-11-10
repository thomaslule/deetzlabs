const nock = require('nock');
const request = require('supertest');
const mockAchievement = require('./util/mockAchievement');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');
const showTestAchievement = require('./util/showTestAchievement');

let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => initApp(db).then((res) => { app = res; }));

afterEach(() => {
  nock.cleanAll();
  return db.dropDatabase();
});

afterAll(() => db.close(true));

const getVolume = () => request(app).get('/api/achievement_volume').expect(200);
const postVolume = volume => request(app).post('/api/change_achievement_volume').send({ volume });

test('volume modified on POST /change_achievement_volume', (done) => {
  const expectedCall = mockAchievement('Testeuse', '%USER% bidouille des trucs', 'Berzingator2000', 0.8);
  postVolume('0.8')
    .expect(200)
    .then(() => showTestAchievement(app))
    .then(() => {
      expectedCall.done();
      done();
    });
});

test('if never set volume is 0.5', (done) => {
  const expectedCall = mockAchievement('Testeuse', '%USER% bidouille des trucs', 'Berzingator2000', 0.5);
  showTestAchievement(app)
    .then(() => {
      expectedCall.done();
      done();
    });
});

test('GET /achievement_volume works', (done) => {
  getVolume()
    .then((response) => {
      expect(response.body.volume).toBe(0.5);
      return postVolume(0.8);
    })
    .then(getVolume)
    .then((response) => {
      expect(response.body.volume).toBe(0.8);
      done();
    });
});

test('bad request on POST /change_achievement_volume with invalid volume', () =>
  postVolume(0).expect(422)
    .then(() => postVolume(50).expect(422))
    .then(() => postVolume('abcd').expect(422)));
