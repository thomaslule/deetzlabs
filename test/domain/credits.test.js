const {
  setup, postMessage, cheer, beginStream,
} = require('./util');
const getCredits = require('../../src/domain/credits/projection').get;
const getDisplayName = require('../../src/domain/viewer/projections/displayNames').get;
const config = require('../config');

let closet;
beforeEach(() => {
  ({ closet } = setup());
});

test('credits work', async () => {
  await beginStream(closet);
  await postMessage(closet);
  await cheer(closet);
  await new Promise(setImmediate);

  const [credits, displayNames] = await Promise.all([
    closet.getProjection('credits'),
    closet.getProjection('displayNames'),
  ]);
  expect(getCredits(credits, id => getDisplayName(displayNames, id), config.achievements))
    .toEqual({
      games: ['Tetris'],
      viewers: ['Someone'],
      hosts: [],
      achievements: [{ viewer: 'Someone', achievement: 'Cheerleader' }],
      subscribes: [],
      donators: ['Someone'],
      follows: [],
    });
});
