const achievements = require('./achievements');
const { sentChatMessage } = require('./viewer/events');

test('2 messages with more that 100 days between => success', () => {
  const first = sentChatMessage('someone', 'Someone', 'coucou');
  first.insert_date = '2017-11-12T13:48:27.028Z';
  const second = sentChatMessage('someone', 'Someone', 're');
  second.insert_date = '2018-02-21T13:48:27.028Z';
  const result = [first, second].reduce(achievements.elder.reducer, undefined);
  expect(result.deserved).toBeTruthy();
});
