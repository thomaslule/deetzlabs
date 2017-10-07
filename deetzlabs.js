const showAchievement = require('./apis/showAchievement');
const sendChatMessage = require('./apis/sendChatMessage');
const achievementModule = require('./modules/achievement');
const viewersModule = require('./modules/viewers');
const gravediggerModule = require('./modules/gravedigger');
const swedishModule = require('./modules/swedish');
const cheerleaderModule = require('./modules/cheerleader');
const commandsModule = require('./modules/commandCommands');
const succesModule = require('./modules/commandSucces');
const countMessagesModule = require('./modules/countMessages');
const testAchievementModule = require('./modules/testAchievement');

module.exports = (storage) => {
  const achievement = achievementModule(storage, showAchievement);
  const viewers = viewersModule(storage);
  const gravedigger = gravediggerModule(storage, achievement.received);
  const swedish = swedishModule(achievement.received);
  const cheerleader = cheerleaderModule(storage, achievement.received);
  const commands = commandsModule(sendChatMessage);
  const succes = succesModule(achievement.get, sendChatMessage);
  const countMessages = countMessagesModule(storage, achievement.received);
  const testAchievement = testAchievementModule(showAchievement);

  return {
    achievement,
    viewers,
    gravedigger,
    swedish,
    cheerleader,
    commands,
    succes,
    countMessages,
    testAchievement,
  };
};
