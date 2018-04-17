const { setup, cheer, expectAchievement } = require('./util');

let closet; let showAchievement;
beforeEach(() => {
  ({ closet, showAchievement } = setup());
});

test('achievement benefactor on first cheer', (done) => {
  cheer(closet)
    .then(() => expectAchievement(showAchievement, 'Mécène'))
    .then(() => done());
});
