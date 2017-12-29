const fs = require('fs');
const { Writable } = require('stream');
const { configureLogger } = require('./logger');
const EventStore = require('./eventStore');
const Bus = require('./bus');
const AchievementAlert = require('./modules/achievementAlert');
const DisplayNames = require('./viewer/projections/displayName');
const ViewersAchievements = require('./viewer/projections/achievements');
const Settings = require('./settings/projections/settings');
const Commands = require('./commands');
const ChatBot = require('./modules/chatBot');

const replayWritable = bus => new Writable({
  objectMode: true,
  async write(event, encoding, callback) {
    await bus.replay(event);
    callback();
  },
});

module.exports = (db) => {
  configureLogger();
  const store = EventStore(db);
  const bus = Bus();
  const settings = Settings(bus);
  const displayNames = DisplayNames(bus);
  const achievementAlert = AchievementAlert(bus, settings, displayNames);
  const viewersAchievements = ViewersAchievements(bus);
  const commands = Commands(displayNames, viewersAchievements);
  ChatBot(bus, commands);

  const init = async () => {
    const query = fs.readFileSync('db/schema.sql').toString();
    await db.query(query);
    const eventsStream = await store.getEverything();
    return new Promise((resolve) => {
      eventsStream.pipe(replayWritable(bus)).on('finish', resolve);
    });
  };

  return {
    init,
    store,
    bus,
    achievementAlert,
    viewersAchievements,
    displayNames,
    settings,
  };
};
