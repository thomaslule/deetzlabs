const { eventsTypes } = require('./events');

module.exports = (state = { achievementsReceived: [], connected: false }, event) => {
  if (event.type === eventsTypes.gotAchievement) {
    return {
      ...state,
      achievementsReceived: state.achievementsReceived.concat(event.achievement),
    };
  }
  if (event.type === eventsTypes.migratedData) {
    return {
      ...state,
      achievementsReceived: state.achievementsReceived
        .concat(event.achievements.map(a => a.achievement)),
    };
  }
  if (event.type === eventsTypes.joined) {
    return { ...state, connected: true };
  }
  if (event.type === eventsTypes.left) {
    return { ...state, connected: false };
  }
  return state;
};
