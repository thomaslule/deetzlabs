const events = require('./events').eventsTypes;

module.exports = (state = { achievementsReceived: [] }, event) => {
  if (event.type === events.gotAchievement) {
    return {
      ...state,
      achievementsReceived: state.achievementsReceived.concat(event.achievement),
    };
  }
  return state;
};
