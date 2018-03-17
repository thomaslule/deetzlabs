const decProj = require('./decisionProjection');
const commands = require('./commands');
const distributedAchievementsProjection = require('./projections/distributedAchievements').default;
const displayNamesProjection = require('./projections/displayNames').default;
const achievementProgressionProjection = require('./projections/achievementsProgression');
const distributeAchievementListener = require('./listeners/distributeAchievement');
const showAchievementListener = require('./listeners/showAchievement');
const commandsCommandListener = require('./listeners/commandsCommand');
const succesCommandListener = require('./listeners/succesCommand');
const routes = require('./routes');

module.exports = (closet) => {
  closet.registerAggregate('viewer', decProj);
  Object.keys(commands).forEach((command) => { closet.registerCommand('viewer', command, commands[command]); });
  closet.registerProjection('distributedAchievements', ['viewer'], distributedAchievementsProjection);
  closet.registerProjection('displayNames', ['viewer'], displayNamesProjection);
  closet.registerProjection('achievementsProgression', ['viewer', 'stream'], achievementProgressionProjection, {
    onChange: distributeAchievementListener(closet),
  });
  closet.onEvent(showAchievementListener(closet));
  closet.onEvent(commandsCommandListener);
  closet.onEvent(succesCommandListener(closet));

  return {
    routes: routes(closet),
  };
};
