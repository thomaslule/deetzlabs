const eventsTypes = {
  achievementVolumeChanged: 'achievement-volume-changed',
  followersGoalChanged: 'followers-goal-changed',
};

const createEvent = (type, content) => ({
  version: 1,
  type,
  ...content,
});

const achievementVolumeChanged = volume =>
  createEvent(eventsTypes.achievementVolumeChanged, { volume });

const followersGoalChanged = settings =>
  createEvent(eventsTypes.followersGoalChanged, { settings });

module.exports = {
  eventsTypes,
  achievementVolumeChanged,
  followersGoalChanged,
};
