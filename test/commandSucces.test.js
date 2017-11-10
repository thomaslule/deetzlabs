const nock = require('nock');
const postMessage = require('./util/postMessage');
const mockSay = require('./util/mockSay');
const mockAllShowAchievements = require('./util/mockAllShowAchievements');
const postAchievement = require('./util/postAchievement');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');

let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => initApp(db)
  .then((res) => {
    app = res;
    mockAllShowAchievements();
  }));

afterEach(() => {
  nock.cleanAll();
  return db.dropDatabase();
});

afterAll(() => db.close(true));

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
  postAchievement(app, 'Fossoyeuse')
    .then(() => postMessage(app, '!succès'))
    .then(() => {
      expectedCall.done();
      done();
    });
});

test('!succès with 2 achievement', (done) => {
  const expectedCall = mockSay('Bravo Someone pour tes succès : Fossoyeuse, Suédois LV1 !');
  postAchievement(app, 'Fossoyeuse')
    .then(() => postAchievement(app, 'Suédois LV1'))
    .then(() => postMessage(app, '!succès'))
    .then(() => {
      expectedCall.done();
      done();
    });
});

test('!succès reads only caller achievements', (done) => {
  const expectedCall = mockSay('Bravo Someone pour tes succès : Fossoyeuse !');
  postAchievement(app, 'Fossoyeuse')
    .then(() => postAchievement(app, 'Suédois LV1', 200, 'other', 'Other'))
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
