const decProj = require('./decisionProjection');
const commands = require('./commands');
const distributedAchievementsProjection = require('./distributedAchievementsProjection').default;
const routes = require('./routes');

module.exports = (closet) => {
  closet.registerAggregate('viewer', decProj);
  Object.keys(commands).forEach((command) => { closet.registerCommand('viewer', command, commands[command]); });
  closet.registerProjection('distributedAchievements', ['viewer'], distributedAchievementsProjection);

  return {
    routes: routes(closet),
  };
};
