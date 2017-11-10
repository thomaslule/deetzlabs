const eventsTypes = {
  achievementVolumeChanged: 'achievement-volume-changed',
};

const createEvent = (type, content) => ({
  aggregate: 'settings',
  id: 'settings',
  version: 1,
  insert_date: (new Date()).toISOString(),
  type,
  ...content,
});

const achievementVolumeChanged = volume =>
  createEvent(eventsTypes.achievementVolumeChanged, {
    volume,
  });

module.exports = {
  eventsTypes,
  achievementVolumeChanged,
};
