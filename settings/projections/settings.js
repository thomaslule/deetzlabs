const { eventsTypes } = require('../events');

const projection = (eventsHistory) => {
  const reducer = (currentState, event) => {
    if (event.type === eventsTypes.achievementVolumeChanged) {
      return { ...currentState, achievementVolume: event.volume };
    }
    if (event.type === eventsTypes.followersGoalChanged) {
      return { ...currentState, followersGoal: event.settings };
    }
    return currentState;
  };

  let state = eventsHistory.reduce(reducer, { achievementVolume: 0.5, followersGoal: { goal: 10, html: '<div />', css: '' } });

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

  const getFollowersGoal = () => p.getState().followersGoal;

  return { getAchievementVolume, getFollowersGoal };
};
