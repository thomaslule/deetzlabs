const request = require('supertest');
const nock = require('nock');

const mockAchievement = (achievementName, achievementText, viewerName = 'Someone', volume = 0.5) => (
  nock('http://localhost:3103')
    .post('/achievement', {
      achievementName,
      achievementText,
      viewerName,
      volume,
    })
    .reply(200)
);

const mockAllAchievements = () => nock('http://localhost:3103')
  .post('/achievement')
  .reply(200)
  .persist();


const postAchievement = (
  app,
  achievement,
  expectedCode = 200,
  viewer = 'someone',
) =>
  request(app)
    .post('/give_achievement')
    .send({
      viewer,
      achievement,
    })
    .expect(expectedCode);

const showTestAchievement = app => request(app).post('/show_test_achievement');

const userHasAchievement = (app, achievement) =>
  request(app).get('/all_viewer_achievements')
    .then(res => res.body
      .find(a => a.viewer === 'someone' && a.achievement === achievement));

const postMessage = (app, message, displayName = 'Someone', viewer = 'someone') =>
  request(app)
    .post('/send_chat_message')
    .send({
      viewer,
      displayName,
      message,
    })
    .expect(200);


module.exports = {
  mockAchievement,
  mockAllAchievements,
  postAchievement,
  showTestAchievement,
  userHasAchievement,
  postMessage,
};
