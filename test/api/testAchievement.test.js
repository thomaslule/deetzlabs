const { setup, showTestAchievement } = require('./util');

let app; let showAchievement;
beforeEach(() => {
  ({ app, showAchievement } = setup());
});

test('post to /show_test_achievement shows achievement', (done) => {
  showTestAchievement(app)
    .expect(200)
    .then(() => {
      expect(showAchievement).toHaveBeenCalledWith('Testing', '%USER% tests something', 'berzingator2000', 0.5);
      done();
    });
});
