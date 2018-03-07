const { eventsTypes } = require('../events');

const initState = { achievementVolume: 0.5, followersGoal: { goal: 10, html: '<div />', css: '' } };
const proj = (state = initState, event) => {
  if (event.type === eventsTypes.achievementVolumeChanged) {
    return { ...state, achievementVolume: event.volume };
  }
  if (event.type === eventsTypes.followersGoalChanged) {
    return { ...state, followersGoal: event.settings };
  }
  return state;
};

const getAchievementVolume = state => state.achievementVolume;

const getFollowersGoal = state => state.followersGoal;

module.exports = {
  default: proj,
  getAchievementVolume,
  getFollowersGoal,
};
