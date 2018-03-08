const nock = require('nock');
const App = require('../src/app');
const {
  mockSay, postMessage, mockAllAchievements, postAchievement,
} = require('./util');

let app;
beforeEach(() => { mockAllAchievements(); app = App(); });
afterEach(() => { nock.cleanAll(); });

test('!succès with 0 achievement', (done) => {
  const expectedCall = mockSay('Someone n\'a pas encore de succès, déso.');
  postMessage(app, '!succès')
    .then(() => {
      expectedCall.done();
      done();
    });
});

test('!succès with 1 achievement', (done) => {
  const expectedCall = mockSay('Bravo Someone pour tes succès : Fossoyeuse !');
  postAchievement(app, 'gravedigger')
    .then(() => postMessage(app, '!succès'))
    .then(() => {
      expectedCall.done();
      done();
    });
});

test('!succès with 2 achievement', (done) => {
  const expectedCall = mockSay('Bravo Someone pour tes succès : Fossoyeuse, Suédois LV1 !');
  postAchievement(app, 'gravedigger')
    .then(() => postAchievement(app, 'swedish'))
    .then(() => postMessage(app, '!succès'))
    .then(() => {
      expectedCall.done();
      done();
    });
});

test('!succès reads only caller achievements', (done) => {
  const expectedCall = mockSay('Bravo Someone pour tes succès : Fossoyeuse !');
  postAchievement(app, 'gravedigger')
    .then(() => postAchievement(app, 'swedish', 200, 'other', 'Other'))
    .then(() => postMessage(app, '!succès'))
    .then(() => {
      expectedCall.done();
      done();
    });
});

test('!succes works too', (done) => {
  const expectedCall = mockSay('Someone n\'a pas encore de succès, déso.');
  postMessage(app, '!succes')
    .then(() => {
      expectedCall.done();
      done();
    });
});
