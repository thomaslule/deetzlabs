const Closet = require('event-closet').default;
const { log } = require('../logger');
const configureViewer = require('./viewer');
const configureStream = require('./stream');
const configureSettings = require('./settings');
const configureCredits = require('./credits');

module.exports = (opts = {}) => {
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
