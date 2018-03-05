const viewerEvents = require('../viewer/events').eventsTypes;
const achievements = require('./achievements');

const viewerProj = (state = { achievementsReceived: [], achievements: {} }, event) => {
  if (event.aggregate === 'viewer' && event.type === viewerEvents.gotAchievement) {
    return {
      ...state,
      achievementsReceived: state.achievementsReceived.concat(event.achievement),
    };
  }
  return {
    ...state,
    achievements: Object.keys(achievements).reduce((obj, achievement) => ({
      ...obj,
      [achievement]: achievements[achievement].reducer(state.achievements[achievement], event),
    }), {}),
  };
};

module.exports = (state = {}, event) => {
  if (event.aggregate === 'viewer') {
    return {
      ...state,
      [event.id]: viewerProj(state[event.id], event),
    };
  }
  if (event.aggregate === 'stream') {
    return Object.keys(state).reduce((obj, viewer) => ({
      ...obj,
      [viewer]: viewerProj(state[viewer], event),
    }), {});
  }
  return state;
};
