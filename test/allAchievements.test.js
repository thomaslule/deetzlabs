const nock = require('nock');
const request = require('supertest');
const initApp = require('./util/initApp');
const postAchievement = require('./util/postAchievement');
const postMessage = require('./util/postMessage');

let storage;
let app;

beforeEach(() => {
  ({ storage, app } = initApp());
  nock('http://localhost:3103')
    .post('/achievement')
    .reply(200)
    .persist();
});

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
});

test('GET /all_achievements returns the achievements', (done) => {
  postMessage(app, 'something magic')
    .then(() => postAchievement(app, 'berzingue'))
    .then(() => postAchievement(app, 'swedish'))
    .then(() => postAchievement(app, 'gravedigger'))
    .then(() => postAchievement(app, 'cheerleader'))
    .then(() => postAchievement(app, 'benefactor'))
    .then(() => postAchievement(app, 'entertainer'))
    .then(() => request(app).get('/api/all_achievements').expect(200))
    .then((response) => {
      const list = response.body;
      expect(list.length).toBe(6);
      expect(list[0]).toEqual({ username: 'Someone', achievement: { code: 'berzingue', name: 'Berzingos' } });
      expect(list[5]).toEqual({ username: 'Someone', achievement: { code: 'entertainer', name: 'Ambianceuse' } });
      done();
    });
});
