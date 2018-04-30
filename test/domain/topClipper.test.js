const { setup } = require('./util');

let closet;
beforeEach(() => {
  ({ closet } = setup());
});

const became = viewer => closet.handleCommand('viewer', viewer, 'becomeTopClipper');

const lost = viewer => closet.handleCommand('viewer', viewer, 'loseTopClipper');

const current = () => closet.getProjection('topClipper');

test('top clipper projection is always up to date', async () => {
  expect(await current()).toBeNull();
  await became('viewer1');
  expect(await current()).toEqual('viewer1');
  await lost('viewer1');
  await became('viewer2');
  expect(await current()).toEqual('viewer2');
});
