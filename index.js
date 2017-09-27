const httpServer = require('./httpServer');
const testAchievement = require('./testAchievement');
const achievement = require('./achievement');

const ach = achievement();

const server = httpServer({
  onPostTest: testAchievement,
  onPostAchievement: ach.received,
  onGetAchievements: ach.get,
});

server.listen(3100, () => {
  console.log('listening on *:3100');
});
