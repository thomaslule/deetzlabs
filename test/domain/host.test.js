const configureCloset = require('../../src/domain');
const { configureLogger } = require('../../src/logger');

beforeEach(() => { configureLogger(); });

test('host results in achievement', async () => {
  const showAchievement = jest.fn();
  const closet = configureCloset({ showAchievement });
  await closet.handleCommand('viewer', 'someone', 'host', { nbViewers: 20 });
  await new Promise(setImmediate);
  expect(showAchievement).toHaveBeenCalledWith('Hospitalière', '%USER% nous accueille sur sa chaîne !', 'someone', 0.5);
});
