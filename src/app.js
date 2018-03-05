const { configureLogger } = require('./logger');
const Closet = require('./closet');
const Server = require('./server');
const ViewerModule = require('./viewer');
const AchievementModule = require('./achievement');

module.exports = () => {
  configureLogger();
  const closet = Closet();
  const viewerModule = ViewerModule(closet);
  AchievementModule(closet);
  const server = Server(viewerModule.routes);
  return server;
};
