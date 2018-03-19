const nock = require('nock');
const App = require('../src/app');
const {
  mockAchievement, beginStream, endStream, postMessage,
} = require('./util');

let app;
beforeEach(() => { app = App(); });
afterEach(() => { nock.cleanAll(); });

describe('assiduous', () => {
  test('if someone is here 3 streams in a row, get achievement', async () => {
    const expectedCall = mockAchievement('Assidue', '%USER% est fidèle au poste');

    await postMessage(app);
    await beginStream(app);
    await postMessage(app);
    await postMessage(app);
    await postMessage(app);
    await endStream(app);

    await beginStream(app);
    await postMessage(app);
    await postMessage(app);
    await endStream(app);

    await postMessage(app);
    await beginStream(app);
    // still no achievement at this point
    expect(expectedCall.isDone()).toBeFalsy();
    await postMessage(app);
    expectedCall.done();
  });

  test('if someone misses a stream, no achievement', async () => {
    const expectedCall = mockAchievement('Assidue', '%USER% est fidèle au poste');

    await beginStream(app);
    await postMessage(app);
    await endStream(app);

    await beginStream(app);
    await postMessage(app);
    await endStream(app);

    await beginStream(app);
    await endStream(app);
    // came too late
    await postMessage(app);

    await beginStream(app);
    await postMessage(app);
    await endStream(app);
    expect(expectedCall.isDone()).toBeFalsy();
  });
});
