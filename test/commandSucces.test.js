const nock = require('nock');
const initApp = require('./util/initApp');
const postMessage = require('./util/postMessage');
const mockSay = require('./util/mockSay');
const mockAchievement = require('./util/mockAchievement');
const mockAllShowAchievements = require('./util/mockAllShowAchievements');
const postAchievement = require('./util/postAchievement');

let storage;
let app;

beforeEach(() => {
  ({ storage, app } = initApp());
  mockAllShowAchievements();
});

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
});

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
    .then(() => postAchievement(app, 'swedish', 200, { username: 'other', 'display-name': 'other' }))
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

test('!success works too', (done) => {
  const expectedCall = mockSay('Someone n\'a pas encore de succès, déso.');
  postMessage(app, '!success')
    .then(() => {
      expectedCall.done();
      done();
    });
});
