const {
  setup, postMessage, cheer, beginStream,
} = require('./util');
const getCredits = require('../../src/domain/credits/projection').get;
const getDisplayName = require('../../src/domain/viewer/projections/displayNames').get;

let closet;
beforeEach(() => {
  ({ closet } = setup());
});

test('get the credits with GET /credits', async () => {
  await beginStream(closet);
  await postMessage(closet);
  await cheer(closet);
  await new Promise(setImmediate);

  const [credits, displayNames] = await Promise.all([
    closet.getProjection('credits'),
    closet.getProjection('displayNames'),
  ]);
  expect(getCredits(credits, id => getDisplayName(displayNames, id)))
    .toEqual({
      games: ['Tetris'],
      viewers: ['Someone'],
      hosts: [],
      achievements: [{ viewer: 'Someone', achievement: 'Mécène' }],
      subscribes: [],
      donators: ['Someone'],
      follows: [],
    });
});
