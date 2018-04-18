const Closet = require('event-closet').default;
const { log } = require('../logger');
const configureViewer = require('./viewer');
const configureStream = require('./stream');
const configureSettings = require('./settings');
const configureCredits = require('./credits');

const defaultOptions = {
  closetOptions: {},
  sendChatMessage: () => {},
  showAchievement: () => {},
};

module.exports = (options = {}) => {
  const opts = {
    ...defaultOptions,
    ...options,
  };
  const closet = Closet(opts.closetOptions);
  closet.onEvent((e) => { log.info('Event happened: %s %s %s', e.aggregate, e.id, e.type); });
  configureViewer(closet, opts.sendChatMessage, opts.showAchievement);
  configureStream(closet);
  configureSettings(closet);
  configureCredits(closet);

  return closet;
};
