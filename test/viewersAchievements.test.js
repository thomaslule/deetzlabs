const nock = require('nock');
const request = require('supertest');
const postAchievement = require('./util/postAchievement');
const postMessage = require('./util/postMessage');
const mockAllShowAchievements = require('./util/mockAllShowAchievements');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');

let storage;
let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => initApp(db)
  .then((res) => {
    ({ app, storage } = res);
    mockAllShowAchievements();
  }));

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
  return db.dropDatabase();
});

afterAll(() => db.close(true));

test('GET /viewers_achievements returns the achievements', (done) => {
  postMessage(app, 'something magic')
    .then(() => postAchievement(app, 'Berzingos'))
    .then(() => postAchievement(app, 'Suédois LV1'))
    .then(() => postAchievement(app, 'Fossoyeuse'))
    .then(() => postAchievement(app, 'Pom-pom girl'))
    .then(() => postAchievement(app, 'Mécène'))
    .then(() => postAchievement(app, 'Ambianceuse'))
    .then(() => request(app).get('/api/viewers_achievements').expect(200))
    .then((response) => {
      const list = response.body;
      expect(list.length).toBe(6);
      expect(list[0]).toEqual({ viewer: 'someone', achievement: 'Berzingos' });
      expect(list[5]).toEqual({ viewer: 'someone', achievement: 'Ambianceuse' });
      done();
    });
});
