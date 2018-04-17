const request = require('supertest');
const { setup, postAchievement } = require('./util');

let app;
beforeEach(() => {
  ({ app } = setup());
});

test('GET /all_viewer_achievements returns the achievements', (done) => {
  postAchievement(app, 'berzingue')
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