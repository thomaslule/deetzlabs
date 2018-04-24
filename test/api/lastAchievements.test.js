const request = require('supertest');
const { setup, postAchievement } = require('./util');

let app;
beforeEach(() => {
  ({ app } = setup());
});

test('GET /last_viewer_achievements returns all the achievements if less than 5', (done) => {
  postAchievement(app, 'cheerleader')
    .then(() => request(app).get('/api/last_viewer_achievements').expect(200))
    .then((response) => {
      const list = response.body;
      expect(list.length).toBe(1);
      expect(list[0]).toEqual({ viewer: 'someone', achievement: 'cheerleader' });
      done();
    });
});
