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

beforeEach(() => {
  ({ app, storage } = initApp(db));
  mockAllShowAchievements();
});

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
  return db.dropDatabase();
});

afterAll(() => db.close(true));

test('GET /last_achievements returns the last 5 achievements', (done) => {
  postMessage(app, 'something magic')
    .then(() => postAchievement(app, 'berzingue'))
    .then(() => postAchievement(app, 'swedish'))
    .then(() => postAchievement(app, 'gravedigger'))
    .then(() => postAchievement(app, 'cheerleader'))
    .then(() => postAchievement(app, 'benefactor'))
    .then(() => postAchievement(app, 'entertainer'))
    .then(() => request(app).get('/api/last_achievements').expect(200))
    .then((response) => {
      const list = response.body;
      expect(list.length).toBe(5);
      expect(list[0]).toEqual({ username: 'Someone', achievement: { code: 'entertainer', name: 'Ambianceuse' } });
      expect(list[4]).toEqual({ username: 'Someone', achievement: { code: 'swedish', name: 'Suédois LV1' } });
      done();
    });
});

test('GET /last_achievements returns all the achievements if less than 5', (done) => {
  postMessage(app, '!berzingue')
    .then(() => postAchievement(app, 'berzingue'))
    .then(() => request(app).get('/api/last_achievements').expect(200))
    .then((response) => {
      const list = response.body;
      expect(list.length).toBe(1);
      expect(list[0]).toEqual({ username: 'Someone', achievement: { code: 'berzingue', name: 'Berzingos' } });
      done();
    });
});

test('GET /last_achievements returns a lowercase username if not found in last viewers', (done) => {
  postAchievement(app, 'berzingue')
    .then(() => request(app).get('/api/last_achievements').expect(200))
    .then((response) => {
      const list = response.body;
      expect(list[0]).toEqual({ username: 'someone', achievement: { code: 'berzingue', name: 'Berzingos' } });
      done();
    });
});
