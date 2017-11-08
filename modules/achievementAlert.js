const clone = require('clone');

module.exports = (settings, showAchievement) => {
  const display = (achievement, callback) => {
    const body = clone(achievement);
    body.volume = settings.getAchievementVolume();
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
    display, test,
  };
};
