const events = require('./events');

module.exports = {
  changeAchievementVolume: (projection, { volume }) => events.achievementVolumeChanged(volume),

  changeFollowersGoal: (projection, { goal, html, css }) =>
    events.followersGoalChanged({ goal, html, css }),
};
