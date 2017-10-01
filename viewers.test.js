const viewers = require('./viewers');
const dontPersist = require('./testUtil/dontPersist');

test('store new name', () => {
  const view = viewers(dontPersist());
  view.received('Someone');
  expect(view.get().includes('Someone')).toBeTruthy();
});

test('store new capitalization updates only right name', () => {
  const view = viewers(dontPersist());
  view.received('DontTouch');
  view.received('Someone');
  view.received('SomeOne');
  expect(view.get().includes('DontTouch')).toBeTruthy();
  expect(view.get().includes('SomeOne')).toBeTruthy();
  expect(view.get().includes('Someone')).toBeFalsy();
});
