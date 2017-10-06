const storage = require('node-persist');
const logger = require('./logger');
const httpServer = require('./httpServer');
const showAchievement = require('./showAchievement');
const testAchievement = require('./testAchievement');
const achievement = require('./achievement');
const viewers = require('./viewers');
const config = require('./config');
const gravedigger = require('./gravedigger');
const swedish = require('./swedish');
const pompomgirl = require('./pompomgirl');
const commands = require('./commands');
const sendChatMessage = require('./sendChatMessage');
const succes = require('./commandSucces');
const countMessages = require('./countMessages');

storage.initSync({
  stringify: output => JSON.stringify(output, null, 2),
});

const ach = achievement(storage, showAchievement);
const view = viewers(storage);
const gd = gravedigger(storage, ach.received);
const sw = swedish(ach.received);
const ppg = pompomgirl(storage, ach.received);
const comm = commands(sendChatMessage);
const succ = succes(ach.get, sendChatMessage);
const count = countMessages(storage, ach.received);

const server = httpServer({
  onPostTest: testAchievement,
  onPostAchievement: ach.received,
  onGetAchievements: ach.get,
  onPostViewer: view.received,
  onGetViewers: view.get,
  onPostChatMessage: (user, message) => {
    view.received(user['display-name']);
    gd.receiveMessage(user, message);
    sw.receiveMessage(user, message);
    ppg.receiveMessage(user, message);
    comm.receiveMessage(user, message);
    succ.receiveMessage(user, message);
    count.receiveMessage(user);
  },
});

server.listen(config.server_port, () => {
  logger.info(`listening on ${config.server_port}`);
});
