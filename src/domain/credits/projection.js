const viewerEvtsTypes = require('../viewer/events').eventsTypes;
const streamEvtsTypes = require('../stream/events').eventsTypes;

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

const proj = (state = emptyCredits(''), event) => {
  if (event.aggregate === 'stream') {
    if (event.type === streamEvtsTypes.begun) {
      return emptyCredits(event.game);
    }
    if (event.type === streamEvtsTypes.changedGame) {
      return addItem(state, 'games', event.game);
    }
  }
  if (event.aggregate === 'viewer') {
    if (event.type === viewerEvtsTypes.sentChatMessage) {
      return addItem(state, 'viewers', event.id);
    }
    if (event.type === viewerEvtsTypes.hosted) {
      return addItem(state, 'hosts', event.id);
    }
    if (event.type === viewerEvtsTypes.gotAchievement) {
      return {
        ...state,
        achievements: state.achievements.concat({
          viewer: event.id,
          achievement: event.achievement,
        }),
      };
    }
    if (event.type === viewerEvtsTypes.subscribed
      || event.type === viewerEvtsTypes.resubscribed) {
      return addItem(state, 'subscribes', event.id);
    }
    if (event.type === viewerEvtsTypes.gaveSub) {
      const intermediateState = addItem(state, 'subscribes', event.recipient);
      return addItem(intermediateState, 'donators', event.id);
    }
    if (event.type === viewerEvtsTypes.cheered) {
      return addItem(state, 'donators', event.id);
    }
    if (event.type === viewerEvtsTypes.donated) {
      return addItem(state, 'donators', event.id);
    }
    if (event.type === viewerEvtsTypes.followed) {
      return addItem(state, 'follows', event.id);
    }
  }
  return state;
};

const get = (state, getDisplayName, achievements) => ({
  ...state,
  viewers: state.viewers.map(getDisplayName),
  hosts: state.hosts.map(getDisplayName),
  subscribes: state.subscribes.map(getDisplayName),
  donators: state.donators.map(getDisplayName),
  follows: state.follows.map(getDisplayName),
  achievements: state.achievements.map(a => ({
    viewer: getDisplayName(a.viewer),
    achievement: achievements[a.achievement].name,
  })),
});

module.exports = { default: proj, get };
