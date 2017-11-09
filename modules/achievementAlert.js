const showAchievement = require('../apis/showAchievement');
const achievementDefinitions = require('../achievementDefinitions');

module.exports = (settings, displayNames) => {
  const display = (viewer, achievement) =>
    showAchievement(
      displayNames.get(viewer),
      achievement,
      achievementDefinitions[achievement],
      settings.getAchievementVolume(),
    );

  const test = () => display('Berzingator2000', 'Testeuse');

  return {
    display, test,
  };
};
