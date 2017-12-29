const projection = require('../util/projection');
const viewerEvts = require('../viewer/events');
const streamEvts = require('../stream/events');

const emptyCredits = game => ({
  games: [game],
  viewers: [],
});

module.exports = (bus, displayName) => {
  const p = projection([], emptyCredits(''), (state, event) => {
    if (event.aggregate === 'stream' && event.type === streamEvts.eventsTypes.begun) {
      return emptyCredits(event.game);
    }
    if (event.aggregate === 'stream' && event.type === streamEvts.eventsTypes.changedGame) {
      if (state.games.includes(event.game)) {
        return state;
      }
      return { ...state, games: state.games.concat(event.game) };
    }
    if (event.aggregate === 'viewer' && event.type === viewerEvts.eventsTypes.sentChatMessage) {
      if (state.viewers.includes(event.id)) {
        return state;
      }
      return { ...state, viewers: state.viewers.concat(event.id) };
    }
    return state;
  });
  bus.subscribe('viewer', p.apply);
  bus.subscribe('stream', p.apply);

  const get = () => ({
    ...p.getState(),
    viewers: p.getState().viewers.map(displayName.get),
  });

  return { get };
};
