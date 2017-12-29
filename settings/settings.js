const {
  achievementVolumeChanged,
  followersGoalChanged,
} = require('./events');

const changeAchievementVolume = volume =>
  [achievementVolumeChanged(volume)];

const changeFollowersGoal = settings =>
  [followersGoalChanged(settings)];

module.exports = {
  changeAchievementVolume,
  changeFollowersGoal,
};
