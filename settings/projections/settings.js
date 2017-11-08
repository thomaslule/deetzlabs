const { eventsTypes } = require('../events');

const projection = (eventsHistory) => {
  const reducer = (currentState, event) => {
    if (event.type === eventsTypes.achievementVolumeChanged) {
      return { ...currentState, achievementVolume: event.volume };
    }
    return currentState;
  };

  let state = eventsHistory.reduce(reducer, { achievementVolume: '0.5' });

  const apply = (event) => {
    state = reducer(state, event);
  };

  const getState = () => state;

  return { apply, getState };
};

module.exports = (bus) => {
  const p = projection([]);
  bus.subscribe('settings', p.apply);

  const getAchievementVolume = () => p.getState().achievementVolume;

  return { getAchievementVolume };
};
