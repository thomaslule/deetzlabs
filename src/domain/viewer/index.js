const decProj = require('./decisionProjection');
const Commands = require('./commands');
const distributedAchievementsProjection = require('./projections/distributedAchievements').default;
const displayNamesProjection = require('./projections/displayNames').default;
const achievementProgressionProjection = require('./projections/achievementsProgression');
const distributeAchievementListener = require('./listeners/distributeAchievement');
const showAchievementListener = require('./listeners/showAchievement');
const commandsCommandListener = require('./listeners/commandsCommand');
const achievementsCommandListener = require('./listeners/achievementsCommand');

module.exports = (
  closet, achievements, sendChatMessage,
  showAchievement, achievementsCommand, commandsCommand,
) => {
  closet.registerAggregate('viewer', decProj);
  const commands = Commands(achievements);
  Object.keys(commands).forEach((command) => { closet.registerCommand('viewer', command, commands[command]); });
  closet.registerProjection('distributedAchievements', ['viewer'], distributedAchievementsProjection);
  closet.registerProjection('displayNames', ['viewer'], displayNamesProjection);
  closet.registerProjection('achievementsProgression', ['viewer', 'stream'], achievementProgressionProjection(achievements), {
    onChange: distributeAchievementListener(closet),
  });
  closet.onEvent(showAchievementListener(closet, achievements, showAchievement));
  closet.onEvent(commandsCommandListener(commandsCommand, sendChatMessage));
  closet.onEvent(achievementsCommandListener(
    closet,
    achievements,
    achievementsCommand,
    sendChatMessage,
  ));
};
