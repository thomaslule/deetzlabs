const showAchievement = require('../apis/showAchievement');
const achievements = require('../achievements');

module.exports = (bus, settings, displayNames) => {
  const display = (viewer, achievement) =>
    showAchievement(
      displayNames.get(viewer),
      achievements[achievement].name,
      achievements[achievement].text,
      settings.getAchievementVolume(),
    );

  const test = () => display('Berzingator2000', 'testing');

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
