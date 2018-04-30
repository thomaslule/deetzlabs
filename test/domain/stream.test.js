const {
  setup, beginStream, endStream,
} = require('./util');

let closet;
beforeEach(() => {
  ({ closet } = setup());
});

const changeToMario = () => closet.handleCommand('stream', 'stream', 'changeGame', { game: 'Mario' });

const changeToTetris = () => closet.handleCommand('stream', 'stream', 'changeGame', { game: 'Tetris' });

test('cant begin or end stream twice', async () => {
  await expect(endStream(closet)).resolves.toEqual([]);
  await expect(beginStream(closet)).resolves.toMatchObject({ type: 'begun' });
  await expect(beginStream(closet)).resolves.toEqual([]);
  await expect(endStream(closet)).resolves.toMatchObject({ type: 'ended' });
  await expect(endStream(closet)).resolves.toEqual([]);
});

test('cant change for same game', async () => {
  await expect(beginStream(closet)).resolves.toMatchObject({ type: 'begun' });
  await expect(changeToTetris()).resolves.toEqual([]);
  await expect(changeToMario()).resolves.toMatchObject({ type: 'changed-game' });
  await expect(changeToMario()).resolves.toEqual([]);
  await expect(endStream(closet)).resolves.toMatchObject({ type: 'ended' });
});
