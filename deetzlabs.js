const showAchievement = require('./apis/showAchievement');
const sendChatMessage = require('./apis/sendChatMessage');
const achievementAlertModule = require('./modules/achievementAlert');
const achievementModule = require('./modules/achievement');
const viewersModule = require('./modules/viewers');
const commandsModule = require('./modules/commandCommands');
const succesModule = require('./modules/commandSucces');
const countMessagesModule = require('./modules/countMessages');
const sayNthTimes = require('./modules/sayNthTimes');
const isCommand = require('./util/isCommand');

module.exports = (storage) => {
  const viewers = viewersModule(storage);
  const achievementAlert = achievementAlertModule(storage, showAchievement);
  const achievement = achievementModule(storage, achievementAlert.display, viewers.getDisplayName);
  const commands = commandsModule(sendChatMessage);
  const succes = succesModule(achievement.get, sendChatMessage);
  const countMessages = countMessagesModule(storage, achievement.received);
  const gravedigger = sayNthTimes(storage, achievement.received, message => isCommand('!rip', message), 5, 'gravedigger');
  const cheerleader = sayNthTimes(storage, achievement.received, message => isCommand('!gg', message), 5, 'cheerleader');
  const berzingue = sayNthTimes(storage, achievement.received, message => isCommand('!berzingue', message), 5, 'berzingue');
  const swedish = sayNthTimes(storage, achievement.received, message => isCommand('hej', message.toLowerCase()), 1, 'swedish');
  const careful = sayNthTimes(storage, achievement.received, message => isCommand('!heal', message) || isCommand('!save', message), 5, 'careful');
  const vigilante = sayNthTimes(storage, achievement.received, message => isCommand('!putain', message), 5, 'vigilante');

  return {
    achievement,
    viewers,
    gravedigger,
    swedish,
    cheerleader,
    commands,
    succes,
    countMessages,
    achievementAlert,
    berzingue,
    careful,
    vigilante,
  };
};
