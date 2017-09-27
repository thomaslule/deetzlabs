const httpServer = require('./httpServer');
const showAchievement = require('./showAchievement');
const testAchievement = require('./testAchievement');
const achievement = require('./achievement');
const storage = require('node-persist');

storage.initSync({
  stringify: output => JSON.stringify(output, null, 2),
});

const ach = achievement(storage, showAchievement);

const server = httpServer({
  onPostTest: testAchievement,
  onPostAchievement: ach.received,
  onGetAchievements: ach.get,
});

server.listen(3100, () => {
  console.log('listening on *:3100');
});
