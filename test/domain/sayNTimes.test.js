const {
  setup, expectAchievement, expectNoAchievement, postMessage,
} = require('./util');

let closet; let showAchievement;
beforeEach(() => {
  ({ closet, showAchievement } = setup());
});

const repeat = (func, times) => {
  let promise = Promise.resolve();
  let i = times;
  while (i > 0) {
    promise = promise.then(func);
    i -= 1;
  }
  return promise;
};

const testSayNthTimes = async ({
  achievementTitle, achievementText, command, n,
}) => {
  await repeat(() => postMessage(closet, command), n - 1);
  await expectNoAchievement(showAchievement);
  await postMessage(closet, 'something that isnt the command');
  await expectNoAchievement(showAchievement);
  await postMessage(closet, command);
  await expectAchievement(showAchievement, achievementTitle, achievementText);
};

test('say n times !berzingue', () => testSayNthTimes({
  command: '!berzingue',
  n: 5,
  achievementTitle: 'Berzingos',
  achievementText: '%USER% dépasse le mur du son !',
}));

test('say n times !heal', () => testSayNthTimes({
  command: '!heal',
  n: 5,
  achievementTitle: 'Prudente',
  achievementText: '%USER% nous montre la voie de la sagesse',
}));

test('say n times !save', () => testSayNthTimes({
  command: '!save',
  n: 5,
  achievementTitle: 'Prudente',
  achievementText: '%USER% nous montre la voie de la sagesse',
}));

test('say n times !gg', () => testSayNthTimes({
  command: '!gg',
  n: 5,
  achievementTitle: 'Pom-pom girl',
  achievementText: 'Merci pour tes encouragements %USER% !',
}));

test('say n times !rip', () => testSayNthTimes({
  command: '!rip',
  n: 5,
  achievementTitle: 'Fossoyeuse',
  achievementText: '%USER% est un peu sadique...',
}));

test('say hej', () => testSayNthTimes({
  command: 'hej',
  n: 1,
  achievementTitle: 'Suédois LV1',
  achievementText: 'Hej %USER% !',
}));

test('say Hej !', () => testSayNthTimes({
  command: 'Hej !',
  n: 1,
  achievementTitle: 'Suédois LV1',
  achievementText: 'Hej %USER% !',
}));

test('say n times !putain', () => testSayNthTimes({
  command: '!putain',
  n: 5,
  achievementTitle: 'Vigilance constante',
  achievementText: '%USER% ne laisse rien passer !',
}));

test('say n times !fire', () => testSayNthTimes({
  command: '!fire',
  n: 5,
  achievementTitle: 'Pyromane',
  achievementText: '%USER% allume le feu',
}));
