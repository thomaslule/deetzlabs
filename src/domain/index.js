const Closet = require('event-closet').default;
const { log } = require('../logger');
const ViewerModule = require('./viewer');
const StreamModule = require('./stream');
const SettingsModule = require('./settings');
const CreditsModule = require('./credits');

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
  ViewerModule(closet, opts.sendChatMessage, opts.showAchievement);
  StreamModule(closet);
  SettingsModule(closet);
  CreditsModule(closet);

  return closet;
};
