const fs = require('fs');
const { Writable } = require('stream');
const { configureLogger } = require('./logger');
const EventStore = require('./eventStore');
const SnapshotStore = require('./snapshotStore');
const AggregateEventStore = require('./aggregateEventStore');
const Bus = require('./bus');
const AchievementAlert = require('./modules/achievementAlert');
const DisplayNames = require('./viewer/projections/displayName');
const ViewersAchievements = require('./viewer/projections/achievements');
const SettingsProj = require('./settings/projections/settings');
const Commands = require('./commands');
const ChatBot = require('./modules/chatBot');
const Viewer = require('./viewer/viewer');
const Settings = require('./settings/settings');
const Stream = require('./stream/stream');

const replayWritable = bus => new Writable({
  objectMode: true,
  async write(event, encoding, callback) {
    await bus.replay(event);
    callback();
  },
});

module.exports = (db) => {
  configureLogger();
  const bus = Bus();
  const eventStore = EventStore(db, bus.dispatch);
  const snapshotStore = SnapshotStore(db);
  const viewerStore = AggregateEventStore(eventStore, snapshotStore, 'viewer', Viewer);
  const streamStore = AggregateEventStore(eventStore, snapshotStore, 'stream', Stream);
  const settingsStore = AggregateEventStore(eventStore, snapshotStore, 'settings', Settings);
  const settings = SettingsProj(bus);
  const displayNames = DisplayNames(bus);
  const achievementAlert = AchievementAlert(bus, settings, displayNames);
  const viewersAchievements = ViewersAchievements(bus);
  const commands = Commands(displayNames, viewersAchievements);
  ChatBot(bus, commands);

  const init = async () => {
    const query = fs.readFileSync('db/schema.sql').toString();
    await db.query(query);
    await snapshotStore.empty();
    const eventsStream = await eventStore.getEverything();
    return new Promise((resolve) => {
      eventsStream.pipe(replayWritable(bus)).on('finish', resolve);
    });
  };

  return {
    init,
    viewerStore,
    streamStore,
    settingsStore,
    achievementAlert,
    viewersAchievements,
    displayNames,
    settings,
  };
};
