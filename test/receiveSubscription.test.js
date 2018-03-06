const nock = require('nock');
const request = require('supertest');
const App = require('../src/app');
const { mockAchievement, userHasAchievement } = require('./util');

let app;
beforeEach(() => { app = App(); });
afterEach(() => { nock.cleanAll(); });

test('achievement benefactor on sub', (done) => {
  const expectedCall = mockAchievement('Mécène', 'Cool ! Merci pour ton soutien %USER%', 'someone');
  request(app)
    .post('/subscribe')
    .send({
      viewer: 'someone',
      displayName: 'Someone',
      methods: { prime: false, plan: 1000, planName: 'some plan' },
    })
    .expect(200)
    .then(() => {
      expectedCall.done();
      return userHasAchievement(app, 'benefactor');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeTruthy();
      done();
    });
});

test('dont crash on resub', () =>
  request(app)
    .post('/resub')
    .send({
      viewer: 'someone',
      months: 6,
      methods: { prime: false, plan: 1000, planName: 'some plan' },
      message: 'hey!',
    })
    .expect(200));
