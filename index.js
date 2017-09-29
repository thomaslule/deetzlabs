const storage = require('node-persist');
const logger = require('./logger');
const httpServer = require('./httpServer');
const showAchievement = require('./showAchievement');
const testAchievement = require('./testAchievement');
const achievement = require('./achievement');
const config = require('./config');


storage.initSync({
  stringify: output => JSON.stringify(output, null, 2),
});

const ach = achievement(storage, showAchievement);

const server = httpServer({
  onPostTest: testAchievement,
  onPostAchievement: ach.received,
  onGetAchievements: ach.get,
});

server.listen(config.server_port, () => {
  logger.info(`listening on ${config.server_port}`);
});
