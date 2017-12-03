const { eventsTypes } = require('../events');
const projection = require('../../util/projection');

module.exports = (bus) => {
  const p = projection(
    [],
    { achievementVolume: 0.5, followersGoal: { goal: 10, html: '<div />', css: '' } },
    (state, event) => {
      if (event.type === eventsTypes.achievementVolumeChanged) {
        return { ...state, achievementVolume: event.volume };
      }
      if (event.type === eventsTypes.followersGoalChanged) {
        return { ...state, followersGoal: event.settings };
      }
      return state;
    },
  );

  bus.subscribe('settings', p.apply);

  const getAchievementVolume = () => p.getState().achievementVolume;

  const getFollowersGoal = () => p.getState().followersGoal;

  return { getAchievementVolume, getFollowersGoal };
};
