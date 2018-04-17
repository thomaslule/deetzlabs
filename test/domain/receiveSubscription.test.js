const { setup, expectAchievement } = require('./util');

let closet; let showAchievement;
beforeEach(() => {
  ({ closet, showAchievement } = setup());
});

test('achievement benefactor on sub', async () => {
  await closet.handleCommand('viewer', 'someone', 'subscribe', { methods: { prime: false, plan: 1000, planName: 'some plan' } });
  await expectAchievement(showAchievement, 'Mécène');
});
