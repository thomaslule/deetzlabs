const nock = require('nock');
const request = require('supertest');
const App = require('../src/app');
const { mockAchievement, userHasAchievement } = require('./util');

let app;
beforeEach(() => { app = App(); });
afterEach(() => { nock.cleanAll(); });

test('achievement benefactor on first cheer', (done) => {
  const expectedCall = mockAchievement('Mécène', 'Cool ! Merci pour ton soutien %USER%');
  request(app)
    .post('/cheer')
    .send({
      viewer: 'someone',
      displayName: 'Someone',
      amount: 100,
      message: 'hop cheer100',
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
