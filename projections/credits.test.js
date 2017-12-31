const Credits = require('./credits');
const Bus = require('../bus');
const viewerEvts = require('../viewer/events');
const streamEvts = require('../stream/events');

const fakeDisplayNames = { get: id => id };

test('add games and viewers in credits', () => {
  const bus = Bus();
  const credits = Credits(bus, fakeDisplayNames);
  bus.replay(streamEvts.begun('Tetris'));
  bus.replay(streamEvts.changedGame('Mario'));
  bus.replay(viewerEvts.sentChatMessage('viewer 1'));
  bus.replay(viewerEvts.sentChatMessage('viewer 2'));
  expect(credits.get().games).toEqual(['Tetris', 'Mario']);
  expect(credits.get().viewers).toEqual(['viewer 1', 'viewer 2']);
});

test('dont add viewers who speak before the stream started', () => {
  const bus = Bus();
  const credits = Credits(bus, fakeDisplayNames);
  bus.replay(viewerEvts.sentChatMessage('viewer 1'));
  bus.replay(streamEvts.begun('Tetris'));
  bus.replay(viewerEvts.sentChatMessage('viewer 2'));
  expect(credits.get().viewers).toEqual(['viewer 2']);
});