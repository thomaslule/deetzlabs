const {
  achievementVolumeChanged,
  followersGoalChanged,
} = require('./events');
const projection = require('../util/projection');

module.exports = (eventsHistory) => {
  const decProj = projection(eventsHistory, {}, state => state);

  const dispatchAndApply = async (bus, event) => {
    await bus.dispatch(event);
    decProj.apply(event);
  };

  const changeAchievementVolume = (bus, volume) =>
    dispatchAndApply(bus, achievementVolumeChanged(volume));

  const changeFollowersGoal = (bus, settings) =>
    dispatchAndApply(bus, followersGoalChanged(settings));

  return {
    changeAchievementVolume,
    changeFollowersGoal,
  };
};
