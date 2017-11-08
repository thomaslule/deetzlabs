const eventsTypes = {
  achievementVolumeChanged: 'achievement-volume-changed',
};

const baseEvent = {
  aggregate: 'settings',
  id: 'settings',
  version: 1,
};

const achievementVolumeChanged = volume => ({
  ...baseEvent,
  type: eventsTypes.achievementVolumeChanged,
  volume,
});

module.exports = {
  eventsTypes,
  achievementVolumeChanged,
};
