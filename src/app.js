const { configureLogger } = require('./logger');
const Closet = require('./closet');
const Server = require('./server');
const ViewerModule = require('./viewer');
const StreamModule = require('./stream');
const SettingsModule = require('./settings');

module.exports = () => {
  configureLogger();
  const closet = Closet();
  const viewerModule = ViewerModule(closet);
  const streamModule = StreamModule(closet);
  const settingsModule = SettingsModule(closet);
  const server = Server(viewerModule.routes, streamModule.routes, settingsModule.routes);
  return server;
};
