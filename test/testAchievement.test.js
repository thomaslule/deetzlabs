const nock = require('nock');
const App = require('../src/app');
const { mockAchievement, showTestAchievement } = require('./util');

let app;
beforeEach(() => { app = App(); });
afterEach(() => { nock.cleanAll(); });

test('post to /show_test_achievement shows achievement', (done) => {
  const expectedCall = mockAchievement('Testeuse', '%USER% bidouille des trucs', 'Berzingator2000');
  showTestAchievement(app)
    .expect(200)
    .then(() => {
      expectedCall.done();
      done();
    });
});
