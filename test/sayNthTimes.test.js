const nock = require('nock');
const postMessage = require('./util/postMessage');
const mockAchievement = require('./util/mockAchievement');
const userHasAchievement = require('./util/userHasAchievement');
const connectToDb = require('./util/connectToDb');
const initApp = require('./util/initApp');

let storage;
let app;
let db;

beforeAll(() => connectToDb().then((res) => { db = res; }));

beforeEach(() => initApp(db)
  .then((res) => {
    ({ app, storage } = res);
  }));

afterEach(() => {
  nock.cleanAll();
  storage.clearSync();
  return db.dropDatabase();
});

afterAll(() => db.close(true));

const repeat = (func, times) => {
  let promise = Promise.resolve();
  let i = times;
  while (i > 0) {
    promise = promise.then(func);
    i -= 1;
  }
  return promise;
};

const testSayNthTimes = ({
  achievementCode, achievementTitle, achievementText, command, n,
}) => {
  const expectedCall = mockAchievement(achievementTitle, achievementText);
  return repeat(() => postMessage(app, command), n - 1)
    .then(() => {
      expect(expectedCall.isDone()).toBeFalsy();
      return postMessage(app, 'something that isnt the command');
    })
    .then(() => {
      expect(expectedCall.isDone()).toBeFalsy();
      return postMessage(app, command);
    })
    .then(() => {
      expectedCall.done();
      return userHasAchievement(app, achievementCode);
    })
    .then((result) => {
      expect(result).toBeTruthy();
    });
};

test('say n times !berzingue', () => testSayNthTimes({
  command: '!berzingue',
  n: 5,
  achievementCode: 'Berzingos',
  achievementTitle: 'Berzingos',
  achievementText: '%USER% dépasse le mur du son !',
}));

test('say n times !heal', () => testSayNthTimes({
  command: '!heal',
  n: 5,
  achievementCode: 'Prudente',
  achievementTitle: 'Prudente',
  achievementText: '%USER% nous montre la voie de la sagesse',
}));

test('say n times !save', () => testSayNthTimes({
  command: '!save',
  n: 5,
  achievementCode: 'Prudente',
  achievementTitle: 'Prudente',
  achievementText: '%USER% nous montre la voie de la sagesse',
}));

test('say n times !gg', () => testSayNthTimes({
  command: '!gg',
  n: 5,
  achievementCode: 'Pom-pom girl',
  achievementTitle: 'Pom-pom girl',
  achievementText: 'Merci pour tes encouragements %USER% !',
}));

test('say n times !rip', () => testSayNthTimes({
  command: '!rip',
  n: 5,
  achievementCode: 'Fossoyeuse',
  achievementTitle: 'Fossoyeuse',
  achievementText: '%USER% est un peu sadique...',
}));

test('say n times hej', () => testSayNthTimes({
  command: 'hej',
  n: 1,
  achievementCode: 'Suédois LV1',
  achievementTitle: 'Suédois LV1',
  achievementText: 'Hej %USER% !',
}));

test('say n times Hej !', () => testSayNthTimes({
  command: 'Hej !',
  n: 1,
  achievementCode: 'Suédois LV1',
  achievementTitle: 'Suédois LV1',
  achievementText: 'Hej %USER% !',
}));

test('say n times !putain', () => testSayNthTimes({
  command: '!putain',
  n: 5,
  achievementCode: 'Vigilance constante',
  achievementTitle: 'Vigilance constante',
  achievementText: '%USER% ne laisse rien passer !',
}));

test('say anything 300 times', () => {
  const command = 'anything';
  const n = 300;
  const achievementCode = 'Ambianceuse';
  const achievementTitle = 'Ambianceuse';
  const achievementText = 'Bim plein de messages dans le chat, gg %USER%';
  const expectedCall = mockAchievement(achievementTitle, achievementText);
  return repeat(() => postMessage(app, command), n - 1)
    .then(() => {
      expect(expectedCall.isDone()).toBeFalsy();
      return postMessage(app, '300 !');
    })
    .then(() => {
      expectedCall.done();
      return userHasAchievement(app, achievementCode);
    })
    .then((result) => {
      expect(result).toBeTruthy();
    });
});
