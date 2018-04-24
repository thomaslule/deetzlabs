const request = require('supertest');
const { setup, postAchievement } = require('./util');

let app;
beforeEach(() => {
  ({ app } = setup());
});

test('GET /all_viewer_achievements returns the achievements', (done) => {
  postAchievement(app, 'cheerleader')
    .then(() => postAchievement(app, 'testing'))
    .then(() => request(app).get('/api/all_viewer_achievements').expect(200))
    .then((response) => {
      const list = response.body;
      expect(list.length).toBe(2);
      expect(list[0]).toEqual({ viewer: 'someone', achievement: 'cheerleader' });
      expect(list[1]).toEqual({ viewer: 'someone', achievement: 'testing' });
      done();
    });
});
