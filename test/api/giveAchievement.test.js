const { setup, postAchievement, userHasAchievement } = require('./util');

let app; let showAchievement;
beforeEach(() => {
  ({ app, showAchievement } = setup());
});

test('post to /give_achievement gives it to user', (done) => {
  postAchievement(app, 'cheerleader')
    .then(() => {
      expect(showAchievement).toHaveBeenCalledWith('Cheerleader', 'Thank you %USER%!', 'someone', 0.5);
      return userHasAchievement(app, 'cheerleader');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeTruthy();
      done();
    });
});

test('post unknown achievement to /give_achievement gives error', (done) => {
  postAchievement(app, 'Inconnu', 400)
    .then((res) => {
      expect(res.body).toEqual({ error: 'bad_request achievement doesnt exist' });
      expect(showAchievement).not.toHaveBeenCalled();
      return userHasAchievement(app, 'Inconnu');
    })
    .then((hasAchievement) => {
      expect(hasAchievement).toBeFalsy();
      done();
    });
});
