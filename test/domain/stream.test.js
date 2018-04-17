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
  await expect(endStream(closet)).rejects.toEqual(expect.anything());
  await expect(beginStream(closet)).resolves.toEqual(expect.anything());
  await expect(beginStream(closet)).rejects.toEqual(expect.anything());
  await expect(endStream(closet)).resolves.toEqual(expect.anything());
  await expect(endStream(closet)).rejects.toEqual(expect.anything());
});

test('cant change for same game', async () => {
  await expect(beginStream(closet)).resolves.toEqual(expect.anything());
  await expect(changeToTetris()).rejects.toEqual(expect.anything());
  await expect(changeToMario()).resolves.toEqual(expect.anything());
  await expect(changeToMario()).rejects.toEqual(expect.anything());
  await expect(endStream(closet)).resolves.toEqual(expect.anything());
});
