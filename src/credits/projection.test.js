const projection = require('./projection').default;
const { get } = require('./projection');
const viewerEvts = require('../viewer/events');
const streamEvts = require('../stream/events');

const getDisplayName = id => id;

const addStreamFields = event => ({
  ...event,
  aggregate: 'stream',
  id: 'stream',
  insertDate: new Date(),
});

const addViewerFields = (event, id) => ({
  ...event,
  aggregate: 'viewer',
  id,
  insertDate: new Date(),
});

test('add games and viewers in credits', () => {
  const state = [
    addStreamFields(streamEvts.begun('Tetris')),
    addStreamFields(streamEvts.changedGame('Mario')),
    addViewerFields(viewerEvts.sentChatMessage('wesh'), 'viewer1'),
    addViewerFields(viewerEvts.sentChatMessage('alors'), 'viewer1'),
    addViewerFields(viewerEvts.sentChatMessage('wesh'), 'viewer2'),
    addViewerFields(viewerEvts.sentChatMessage('yo'), 'viewer1'),
  ].reduce(projection, undefined);
  expect(get(state, getDisplayName).games).toEqual(['Tetris', 'Mario']);
  expect(get(state, getDisplayName).viewers).toEqual(['viewer1', 'viewer2']);
});

test('dont add viewers who speak before the stream started', () => {
  const state = [
    addViewerFields(viewerEvts.sentChatMessage(), 'viewer1'),
    addStreamFields(streamEvts.begun('Tetris')),
    addViewerFields(viewerEvts.sentChatMessage(), 'viewer2'),
  ].reduce(projection, undefined);
  expect(get(state, getDisplayName).viewers).toEqual(['viewer2']);
});

test('get the display names and the achievements names', () => {
  const state = [
    addStreamFields(streamEvts.begun('Tetris')),
    addViewerFields(viewerEvts.sentChatMessage(), 'someone'),
    addViewerFields(viewerEvts.gotAchievement('elder'), 'someone'),
  ].reduce(projection, undefined);
  const getDisplayName2 = () => 'Someone';
  expect(get(state, getDisplayName2).viewers).toEqual(['Someone']);
  expect(get(state, getDisplayName2).achievements).toEqual([{ viewer: 'Someone', achievement: 'Doyenne' }]);
});

test('add cheers in credits', () => {
  const state = [
    addStreamFields(streamEvts.begun('Tetris')),
    addViewerFields(viewerEvts.cheered(20), 'someone'),
  ].reduce(projection, undefined);
  expect(get(state, getDisplayName).donators).toEqual(['someone']);
});

test('add donations in credits', () => {
  const state = [
    addStreamFields(streamEvts.begun('Tetris')),
    addViewerFields(viewerEvts.donated(20), 'someone'),
  ].reduce(projection, undefined);
  expect(get(state, getDisplayName).donators).toEqual(['someone']);
});
