const Closet = require('event-closet').default;
const { log } = require('../logger');
const configureViewer = require('./viewer');
const configureStream = require('./stream');
const configureSettings = require('./settings');
const configureCredits = require('./credits');

const defaultOptions = {
  closetOptions: {},
  achievements: {
    testing: {
      name: 'Testing',
      text: '%USER% tests something',
      reducer: () => ({ distribute: false }),
    },
  },
  sendChatMessage: () => {},
  showAchievement: () => {},
  achievements_command: {
    command: '!achievements',
    answer: 'Congratulations %USER% for your achievements: %ACHIEVEMENTS%',
    answer_none: '%USER% doesn\'t have any achievement but their time will come!',
  },
  commands_command: {
    command: '!commands',
    answer: 'Say !achievements to see your current achievements',
  },
};

module.exports = (options = {}) => {
  const opts = {
    ...defaultOptions,
    ...options,
  };
  const closet = Closet(opts.closetOptions);
  closet.onEvent((e) => { log.info('Event happened: %s %s %s', e.aggregate, e.id, e.type); });
  configureViewer(
    closet,
    opts.achievements,
    opts.sendChatMessage,
    opts.showAchievement,
    opts.achievements_command,
    opts.commands_command,
  );
  configureStream(closet);
  configureSettings(closet);
  configureCredits(closet);

  return closet;
};
