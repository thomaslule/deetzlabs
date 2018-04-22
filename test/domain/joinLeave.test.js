const { setup } = require('./util');
const { joined, left } = require('../../src/domain/viewer/events');

let closet;
beforeEach(() => {
  ({ closet } = setup());
});

const join = () => closet.handleCommand('viewer', 'someone', 'join');

const leave = () => closet.handleCommand('viewer', 'someone', 'leave');

test('cant join or leave twice', async () => {
  expect(await leave()).toEqual([]);
  expect(await join()).toMatchObject(joined());
  expect(await join()).toMatchObject([]);
  expect(await leave()).toMatchObject(left());
  expect(await leave()).toEqual([]);
});
