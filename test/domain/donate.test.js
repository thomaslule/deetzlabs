const { setup, expectAchievement } = require('./util');

let closet; let showAchievement;
beforeEach(() => {
  ({ closet, showAchievement } = setup());
});

test('donation results in achievement', async () => {
  await closet.handleCommand('viewer', 'someone', 'donate', { amount: 20 });
  await expectAchievement(showAchievement, 'Mécène');
});
