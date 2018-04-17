const { setup, expectAchievement } = require('./util');

let closet; let showAchievement;
beforeEach(() => {
  ({ closet, showAchievement } = setup());
});

test('host results in achievement', async () => {
  await closet.handleCommand('viewer', 'someone', 'host', { nbViewers: 20 });
  await expectAchievement(showAchievement, 'Hospitalière');
});
