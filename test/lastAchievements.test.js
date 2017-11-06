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

test('GET /last_achievements returns the last 5 achievements', (done) => {
  postMessage(app, 'something magic')
    .then(() => postAchievement(app, 'Berzingos'))
    .then(() => postAchievement(app, 'Suédois LV1'))
    .then(() => postAchievement(app, 'Fossoyeuse'))
    .then(() => postAchievement(app, 'Pom-pom girl'))
    .then(() => postAchievement(app, 'Mécène'))
    .then(() => postAchievement(app, 'Ambianceuse'))
    .then(() => request(app).get('/api/last_achievements').expect(200))
    .then((response) => {
      const list = response.body;
      expect(list.length).toBe(5);
      expect(list[0]).toEqual({ viewer: 'someone', achievement: 'Ambianceuse' });
      expect(list[4]).toEqual({ viewer: 'someone', achievement: 'Suédois LV1' });
      done();
    });
});

test('GET /last_achievements returns all the achievements if less than 5', (done) => {
  postMessage(app, '!berzingue')
    .then(() => postAchievement(app, 'Berzingos'))
    .then(() => request(app).get('/api/last_achievements').expect(200))
    .then((response) => {
      const list = response.body;
      expect(list.length).toBe(1);
      expect(list[0]).toEqual({ viewer: 'someone', achievement: 'Berzingos' });
      done();
    });
});
