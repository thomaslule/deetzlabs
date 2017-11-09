const showAchievement = require('../apis/showAchievement');
const achievementDefinitions = require('../achievementDefinitions');

module.exports = (bus, settings, displayNames) => {
  const display = (viewer, achievement) =>
    showAchievement(
      displayNames.get(viewer),
      achievement,
      achievementDefinitions[achievement],
      settings.getAchievementVolume(),
    );

  const test = () => display('Berzingator2000', 'Testeuse');

  bus.subscribe('viewer', (event, isReplay) => {
    if (!isReplay && event.type === 'got-achievement') {
      return display(event.id, event.achievement);
    }
    return Promise.resolve();
  });

  return {
    display, test,
  };
};
