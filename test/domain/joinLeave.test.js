const { setup } = require('./util');

let closet;
beforeEach(() => {
  ({ closet } = setup());
});

const join = () => closet.handleCommand('viewer', 'someone', 'join');

const leave = () => closet.handleCommand('viewer', 'someone', 'leave');

test('cant join or leave twice', async () => {
  await expect(leave()).rejects.toEqual(expect.anything());
  await expect(join()).resolves.toEqual(expect.anything());
  await expect(join()).rejects.toEqual(expect.anything());
  await expect(leave()).resolves.toEqual(expect.anything());
  await expect(leave()).rejects.toEqual(expect.anything());
});
