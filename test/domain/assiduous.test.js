const {
  setup, expectAchievement, expectNoAchievement, postMessage, beginStream, endStream,
} = require('./util');

let closet; let showAchievement;
beforeEach(() => {
  ({ closet, showAchievement } = setup());
});

describe('assiduous', () => {
  test('if someone is here 3 streams in a row, get achievement', async () => {
    await postMessage(closet);
    await beginStream(closet);
    await postMessage(closet);
    await postMessage(closet);
    await postMessage(closet);
    await endStream(closet);

    await beginStream(closet);
    await postMessage(closet);
    await postMessage(closet);
    await endStream(closet);

    await postMessage(closet);
    await beginStream(closet);
    // still no achievement at this point
    await expectNoAchievement(showAchievement);
    await postMessage(closet);
    expectAchievement(showAchievement, 'Assidue');
  });

  test('if someone misses a stream, no achievement', async () => {
    await beginStream(closet);
    await postMessage(closet);
    await endStream(closet);

    await beginStream(closet);
    await postMessage(closet);
    await endStream(closet);

    await beginStream(closet);
    await endStream(closet);
    // came too late
    await postMessage(closet);

    await beginStream(closet);
    await postMessage(closet);
    await endStream(closet);
    await expectNoAchievement(showAchievement);
  });
});
