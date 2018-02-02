const projection = require('../util/projection');
const viewerEvts = require('../viewer/events');
const streamEvts = require('../stream/events');
const achievements = require('../achievements');

const emptyCredits = game => ({
  games: [game],
  viewers: [],
  hosts: [],
  achievements: [],
  subscribes: [],
  donators: [],
  follows: [],
});

const addItem = (state, type, item) => {
  if (state[type].includes(item)) {
    return state;
  }
  return { ...state, [type]: state[type].concat(item) };
};

module.exports = (bus, displayNames) => {
  const p = projection([], emptyCredits(''), (state, event) => {
    if (event.aggregate === 'stream') {
      if (event.type === streamEvts.eventsTypes.begun) {
        return emptyCredits(event.game);
      }
      if (event.type === streamEvts.eventsTypes.changedGame) {
        return addItem(state, 'games', event.game);
      }
    }
    if (event.aggregate === 'viewer') {
      if (event.type === viewerEvts.eventsTypes.sentChatMessage) {
        return addItem(state, 'viewers', event.id);
      }
      if (event.type === viewerEvts.eventsTypes.hosted) {
        return addItem(state, 'hosts', event.id);
      }
      if (event.type === viewerEvts.eventsTypes.gotAchievement) {
        return {
          ...state,
          achievements: state.achievements.concat({
            viewer: event.id,
            achievement: event.achievement,
          }),
        };
      }
      if (event.type === viewerEvts.eventsTypes.subscribed
        || event.type === viewerEvts.eventsTypes.resubscribed) {
        return addItem(state, 'subscribes', event.id);
      }
      if (event.type === viewerEvts.eventsTypes.cheered) {
        return addItem(state, 'donators', event.id);
      }
      if (event.type === viewerEvts.eventsTypes.followed) {
        return addItem(state, 'follows', event.id);
      }
    }
    return state;
  });
  bus.subscribe('viewer', p.apply);
  bus.subscribe('stream', p.apply);

  const get = () => ({
    ...p.getState(),
    viewers: p.getState().viewers.map(displayNames.get),
    hosts: p.getState().hosts.map(displayNames.get),
    subscribes: p.getState().subscribes.map(displayNames.get),
    donators: p.getState().donators.map(displayNames.get),
    follows: p.getState().follows.map(displayNames.get),
    achievements: p.getState().achievements.map(a => ({
      viewer: displayNames.get(a.viewer),
      achievement: achievements[a.achievement].name,
    })),
  });

  return { get };
};
