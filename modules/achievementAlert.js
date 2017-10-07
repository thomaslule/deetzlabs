const clone = require('clone');

module.exports = (storage, showAchievement) => {
  const storageName = 'achievement_alert';

  const getVolume = () => {
    const stored = storage.getItemSync('achievement_alert') || {};
    return stored.volume || '0.5';
  };

  const setVolume = (volume) => {
    const stored = storage.getItemSync('achievement_alert') || {};
    stored.volume = volume;
    storage.setItemSync(storageName, stored);
  };

  const display = (achievement, callback) => {
    const body = clone(achievement);
    body.volume = getVolume();
    showAchievement(body, callback);
  };

  const test = (callback) => {
    display({
      achievement: 'Testeuse',
      username: 'Berzingator2000',
      text: '%USER% bidouille des trucs',
    }, callback);
  };

  return {
    display, test, setVolume, getVolume,
  };
};
