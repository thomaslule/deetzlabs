const request = require('supertest');
const Api = require('../../src/api');
const configureCloset = require('../../src/domain');
const Server = require('../../src/server');
const { configureLogger } = require('../../src/logger');

const noopMiddleware = (req, res, next) => { next(); };

const setup = () => {
  configureLogger();
  const showAchievement = jest.fn();
  const closet = configureCloset({ showAchievement });
  const api = Api(closet);
  const app = Server(api, noopMiddleware, noopMiddleware);
  return { app, showAchievement, closet };
};

const showTestAchievement = app => request(app).post('/api/show_test_achievement');

const postAchievement = (
  app,
  achievement,
  expectedCode = 200,
  viewer = 'someone',
) =>
  request(app)
    .post('/api/give_achievement')
    .send({
      viewer,
      achievement,
    })
    .expect(expectedCode);

const userHasAchievement = (app, achievement) =>
  request(app).get('/api/all_viewer_achievements')
    .then(res => res.body
      .find(a => a.viewer === 'someone' && a.achievement === achievement));

const postMessage = async (closet, message = 'yo', displayName = 'Someone', viewer = 'someone') => {
  await closet.handleCommand('viewer', viewer, 'chatMessage', {
    message,
    displayName,
  });
};

module.exports = {
  setup,
  showTestAchievement,
  postAchievement,
  userHasAchievement,
  postMessage,
};
