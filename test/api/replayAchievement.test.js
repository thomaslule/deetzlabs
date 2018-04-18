const request = require('supertest');
const { setup } = require('./util');

let app; let showAchievement;
beforeEach(() => {
  ({ app, showAchievement } = setup());
});

test('post to /replay_achievement shows achievement', (done) => {
  request(app)
    .post('/api/replay_achievement')
    .send({
      achievement: 'swedish',
      viewer: 'someone',
    })
    .expect(200)
    .then(() => {
      expect(showAchievement).toHaveBeenCalledWith('Suédois LV1', 'Hej %USER% !', 'someone', 0.5);
      done();
    });
});
