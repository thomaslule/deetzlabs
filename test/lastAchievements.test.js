const nock = require('nock');
const request = require('supertest');
const App = require('../src/app');
const { mockAllAchievements, postMessage, postAchievement } = require('./util');

let app;
beforeEach(() => { mockAllAchievements(); app = App(); });
afterEach(() => { nock.cleanAll(); });

test('GET /last_viewer_achievements returns the last 5 achievements', (done) => {
  postMessage(app, 'something magic')
    .then(() => postAchievement(app, 'berzingue'))
    .then(() => postAchievement(app, 'swedish'))
    .then(() => postAchievement(app, 'gravedigger'))
    .then(() => postAchievement(app, 'cheerleader'))
    .then(() => postAchievement(app, 'benefactor'))
    .then(() => postAchievement(app, 'entertainer'))
    .then(() => request(app).get('/last_viewer_achievements').expect(200))
    .then((response) => {
      const list = response.body;
      expect(list.length).toBe(5);
      expect(list[0]).toEqual({ viewer: 'someone', achievement: 'entertainer' });
      expect(list[4]).toEqual({ viewer: 'someone', achievement: 'swedish' });
      done();
    });
});

test('GET /last_viewer_achievements returns all the achievements if less than 5', (done) => {
  postMessage(app, '!berzingue')
    .then(() => postAchievement(app, 'berzingue'))
    .then(() => request(app).get('/last_viewer_achievements').expect(200))
    .then((response) => {
      const list = response.body;
      expect(list.length).toBe(1);
      expect(list[0]).toEqual({ viewer: 'someone', achievement: 'berzingue' });
      done();
    });
});