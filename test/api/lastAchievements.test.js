const request = require('supertest');
const { setup, postAchievement } = require('./util');

let app;
beforeEach(() => {
  ({ app } = setup());
});

test('GET /last_viewer_achievements returns the last 5 achievements', (done) => {
  postAchievement(app, 'berzingue')
    .then(() => postAchievement(app, 'swedish'))
    .then(() => postAchievement(app, 'gravedigger'))
    .then(() => postAchievement(app, 'cheerleader'))
    .then(() => postAchievement(app, 'benefactor'))
    .then(() => postAchievement(app, 'entertainer'))
    .then(() => request(app).get('/api/last_viewer_achievements').expect(200))
    .then((response) => {
      const list = response.body;
      expect(list.length).toBe(5);
      expect(list[0]).toEqual({ viewer: 'someone', achievement: 'entertainer' });
      expect(list[4]).toEqual({ viewer: 'someone', achievement: 'swedish' });
      done();
    });
});

test('GET /last_viewer_achievements returns all the achievements if less than 5', (done) => {
  postAchievement(app, 'berzingue')
    .then(() => request(app).get('/api/last_viewer_achievements').expect(200))
    .then((response) => {
      const list = response.body;
      expect(list.length).toBe(1);
      expect(list[0]).toEqual({ viewer: 'someone', achievement: 'berzingue' });
      done();
    });
});
