const clone = require('clone');
const projection = require('../util/projection');
const { eventsTypes } = require('./events');
const achievements = require('../achievements');

const defaultState = { achievementsReceived: [], achievements: {} };

module.exports = (eventsHistory, initState = defaultState) => projection(
  eventsHistory,
  initState,
  (state, event) => {
    const newState = clone(state);
    Object.keys(achievements).forEach((achievement) => {
      newState.achievements[achievement] = achievements[achievement]
        .reducer(newState.achievements[achievement], event);
    });
    if (event.type === eventsTypes.gotAchievement) {
      return {
        ...newState,
        achievementsReceived: newState.achievementsReceived.concat(event.achievement),
      };
    }
    if (event.type === eventsTypes.joined) {
      return { ...newState, connected: true };
    }
    if (event.type === eventsTypes.left) {
      return { ...newState, connected: false };
    }
    if (event.type === eventsTypes.migratedData) {
      return {
        ...newState,
        achievementsReceived: newState.achievementsReceived
          .concat(event.achievements.map(a => a.achievement)),
      };
    }
    return newState;
  },
);
