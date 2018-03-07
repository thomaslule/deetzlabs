const nock = require('nock');
const request = require('supertest');
const App = require('../src/app');
const { postMessage, mockAllAchievements, postAchievement } = require('./util');

let app;
beforeEach(() => { mockAllAchievements(); app = App(); });
afterEach(() => { nock.cleanAll(); });

test('GET /all_viewer_achievements returns the achievements', (done) => {
  postMessage(app, 'something magic')
    .then(() => postAchievement(app, 'berzingue'))
    .then(() => postAchievement(app, 'swedish'))
    .then(() => postAchievement(app, 'gravedigger'))
    .then(() => postAchievement(app, 'cheerleader'))
    .then(() => postAchievement(app, 'benefactor'))
    .then(() => postAchievement(app, 'entertainer'))
    .then(() => request(app).get('/all_viewer_achievements').expect(200))
    .then((response) => {
      const list = response.body;
      expect(list.length).toBe(6);
      expect(list[0]).toEqual({ viewer: 'someone', achievement: 'berzingue' });
      expect(list[5]).toEqual({ viewer: 'someone', achievement: 'entertainer' });
      done();
    });
});
