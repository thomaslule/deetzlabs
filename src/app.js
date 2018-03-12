const Closet = require('event-closet').default;
const { configureLogger } = require('./logger');
const configureCloset = require('./closet/configureCloset');
const Server = require('./server');
const ViewerModule = require('./viewer');
const StreamModule = require('./stream');
const SettingsModule = require('./settings');
const CreditsModule = require('./credits');

module.exports = (closet = Closet()) => {
  configureLogger();
  configureCloset(closet);
  const viewerModule = ViewerModule(closet);
  const streamModule = StreamModule(closet);
  const settingsModule = SettingsModule(closet);
  const creditsModule = CreditsModule(closet);
  const server = Server(
    viewerModule.routes,
    streamModule.routes,
    settingsModule.routes,
    creditsModule.routes,
  );
  return server;
};
