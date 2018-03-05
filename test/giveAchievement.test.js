const nock = require('nock');
const App = require('../src/app');
const { mockAchievement, postAchievement, userHasAchievement } = require('./util');

let app;
beforeEach(() => { app = App(); });
afterEach(() => { nock.cleanAll(); });

test('post to /give_achievement gives it to user', (done) => {
  const expectedCall = mockAchievement('Mécène', 'Cool ! Merci pour ton soutien %USER%', 'someone');
  postAchievement(app, 'benefactor')
    .then(() => {
      expectedCall.done();
      return userHasAchievement(app, 'benefactor');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeTruthy();
      done();
    });
});

test('post unknown achievement to /give_achievement gives error', (done) => {
  const expectedCall = mockAchievement('Inconnu', 'Bravo %USER% !');
  postAchievement(app, 'Inconnu', 400)
    .then((res) => {
      expect(res.body).toEqual({ error: 'bad_request achievement doesnt exist' });
      expect(expectedCall.isDone()).toBeFalsy();
      return userHasAchievement(app, 'Inconnu');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeFalsy();
      done();
    });
});
