const showAchievement = require('./showAchievement');
const achievementModule = require('./achievement');
const viewersModule = require('./viewers');
const gravediggerModule = require('./gravedigger');
const swedishModule = require('./swedish');
const pompomgirlModule = require('./pompomgirl');
const commandsModule = require('./commands');
const sendChatMessageModule = require('./sendChatMessage');
const succesModule = require('./commandSucces');
const countMessagesModule = require('./countMessages');

module.exports = (storage) => {
  const achievement = achievementModule(storage, showAchievement);
  const viewers = viewersModule(storage);
  const gravedigger = gravediggerModule(storage, achievement.received);
  const swedish = swedishModule(achievement.received);
  const pompomgirl = pompomgirlModule(storage, achievement.received);
  const commands = commandsModule(sendChatMessageModule);
  const succes = succesModule(achievement.get, sendChatMessageModule);
  const countMessages = countMessagesModule(storage, achievement.received);

  return {
    achievement, viewers, gravedigger, swedish, pompomgirl, commands, succes, countMessages,
  };
};
