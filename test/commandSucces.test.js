const nock = require('nock');
const initApp = require('./util/initApp');
const postMessage = require('./util/postMessage');
const mockSay = require('./util/mockSay');
const mockAchievement = require('./util/mockAchievement');

let storage;
let app;

beforeEach(() => {
  ({ storage, app } = initApp());
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
  storage.setItem('achievements', [{ username: 'someone', achievement: 'gravedigger' }]);
  const expectedCall = mockSay('Bravo Someone pour tes succès : Fossoyeuse !');
  postMessage(app, '!succès')
    .then(() => {
      expectedCall.done();
      done();
    });
});

test('!succès with 2 achievement', (done) => {
  storage.setItem('achievements', [{ username: 'someone', achievement: 'gravedigger' }, { username: 'someone', achievement: 'swedish' }]);
  const expectedCall = mockSay('Bravo Someone pour tes succès : Fossoyeuse, Suédois LV1 !');
  postMessage(app, '!succès')
    .then(() => {
      expectedCall.done();
      done();
    });
});

test('!succès reads only caller achievements', (done) => {
  storage.setItem('achievements', [{ username: 'someone', achievement: 'gravedigger' }, { username: 'other', achievement: 'swedish' }]);
  const expectedCall = mockSay('Bravo Someone pour tes succès : Fossoyeuse !');
  postMessage(app, '!succès')
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

test('integration with swedish', (done) => {
  mockAchievement('Suédois LV1', 'Hej %USER% !');
  const expectedCall = mockSay('Bravo Someone pour tes succès : Suédois LV1 !');
  postMessage(app, 'Hej !')
    .then(() => postMessage(app, '!succès'))
    .then(() => {
      expectedCall.done();
      done();
    });
});
