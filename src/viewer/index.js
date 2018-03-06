const decProj = require('./decisionProjection');
const commands = require('./commands');
const distributedAchievementsProjection = require('./projections/distributedAchievements').default;
const displayNamesProjection = require('./projections/displayNames').default;
const achievementProgressionProjection = require('./projections/achievementsProgression');
const AchievementListener = require('./achievementListener');
const routes = require('./routes');

module.exports = (closet) => {
  closet.registerAggregate('viewer', decProj);
  Object.keys(commands).forEach((command) => { closet.registerCommand('viewer', command, commands[command]); });
  closet.registerProjection('distributedAchievements', ['viewer'], distributedAchievementsProjection);
  closet.registerProjection('displayNames', ['viewer'], displayNamesProjection);
  const achievementListener = AchievementListener(closet);
  closet.registerProjection('achievementsProgression', ['viewer'], achievementProgressionProjection, {
    onChange: achievementListener.distribute,
  });
  closet.onEvent(achievementListener.show);

  return {
    routes: routes(closet),
  };
};
