const viewerEvents = require('../events').eventsTypes;
const achievements = require('../achievements');

/* eslint-disable no-param-reassign */
/* this projections is quite big so for performance reasons we do in-place editing */
const viewerProj = (state = { achievementsReceived: [], achievements: {} }, event) => {
  if (event.aggregate === 'viewer' && event.type === viewerEvents.gotAchievement) {
    state.achievementsReceived.push(event.achievement);
  } else if (event.aggregate === 'viewer' && event.type === viewerEvents.migratedData) {
    event.achievements.forEach((a) => {
      state.achievementsReceived.push(a.achievement);
    });
  } else {
    Object.keys(achievements).forEach((achievement) => {
      state.achievements[achievement] = achievements[achievement]
        .reducer(state.achievements[achievement], event);
    });
  }
  return state;
};

module.exports = (state = {}, event) => {
  if (event.aggregate === 'viewer' && event.type !== viewerEvents.joined && event.type !== viewerEvents.left) {
    state[event.id] = viewerProj(state[event.id], event);
  }
  if (event.aggregate === 'stream') {
    Object.keys(state).forEach((id) => {
      state[id] = viewerProj(state[id], event);
    });
  }
  return state;
};
/* eslint-enable no-param-reassign */
