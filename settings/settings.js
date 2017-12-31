const {
  achievementVolumeChanged,
  followersGoalChanged,
} = require('./events');

module.exports = () => {
  const changeAchievementVolume = volume =>
    [achievementVolumeChanged(volume)];

  const changeFollowersGoal = settings =>
    [followersGoalChanged(settings)];

  return {
    getState: () => {},
    changeAchievementVolume,
    changeFollowersGoal,
  };
};
