const nock = require('nock');
const App = require('../src/app');
const { mockAchievement, userHasAchievement, postMessage } = require('./util');

let app;
beforeEach(() => { app = App(); });
afterEach(() => { nock.cleanAll(); });

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
  achievementCode: 'berzingue',
  achievementTitle: 'Berzingos',
  achievementText: '%USER% dépasse le mur du son !',
}));

test('say n times !heal', () => testSayNthTimes({
  command: '!heal',
  n: 5,
  achievementCode: 'careful',
  achievementTitle: 'Prudente',
  achievementText: '%USER% nous montre la voie de la sagesse',
}));

test('say n times !save', () => testSayNthTimes({
  command: '!save',
  n: 5,
  achievementCode: 'careful',
  achievementTitle: 'Prudente',
  achievementText: '%USER% nous montre la voie de la sagesse',
}));

test('say n times !gg', () => testSayNthTimes({
  command: '!gg',
  n: 5,
  achievementCode: 'cheerleader',
  achievementTitle: 'Pom-pom girl',
  achievementText: 'Merci pour tes encouragements %USER% !',
}));

test('say n times !rip', () => testSayNthTimes({
  command: '!rip',
  n: 5,
  achievementCode: 'gravedigger',
  achievementTitle: 'Fossoyeuse',
  achievementText: '%USER% est un peu sadique...',
}));

test('say hej', () => testSayNthTimes({
  command: 'hej',
  n: 1,
  achievementCode: 'swedish',
  achievementTitle: 'Suédois LV1',
  achievementText: 'Hej %USER% !',
}));

test('say Hej !', () => testSayNthTimes({
  command: 'Hej !',
  n: 1,
  achievementCode: 'swedish',
  achievementTitle: 'Suédois LV1',
  achievementText: 'Hej %USER% !',
}));

test('say n times !putain', () => testSayNthTimes({
  command: '!putain',
  n: 5,
  achievementCode: 'vigilante',
  achievementTitle: 'Vigilance constante',
  achievementText: '%USER% ne laisse rien passer !',
}));

test('say n times !fire', () => testSayNthTimes({
  command: '!fire',
  n: 5,
  achievementCode: 'pyromaniac',
  achievementTitle: 'Pyromane',
  achievementText: '%USER% allume le feu',
}));
