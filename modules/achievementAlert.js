const clone = require('clone');

module.exports = (storage, showAchievement) => {
  const storageName = 'achievement_alert';

  const display = (achievement, callback) => {
    const body = clone(achievement);
    const stored = storage.getItemSync('achievement_alert') || {};
    body.volume = stored.volume || '0.5';
    showAchievement(body, callback);
  };

  const test = (callback) => {
    display({
      achievement: 'Testeuse',
      username: 'Berzingator2000',
      text: '%USER% bidouille des trucs',
    }, callback);
  };

  const setVolume = (volume) => {
    const stored = storage.getItemSync('achievement_alert') || {};
    stored.volume = volume;
    storage.setItemSync(storageName, stored);
  };

  return { display, test, setVolume };
};
