const fs = require('fs');
const { Writable } = require('stream');
const { configureLogger, log } = require('./logger');
const EventStore = require('./store/eventStore');
const SnapshotStore = require('./store/snapshotStore');
const SnapshotTaker = require('./store/snapshotTaker');
const AggregateEventStore = require('./store/aggregateEventStore');
const Bus = require('./bus');
const AchievementAlert = require('./modules/achievementAlert');
const DisplayNames = require('./viewer/projections/displayName');
const ViewersAchievements = require('./viewer/projections/achievements');
const SettingsProj = require('./settings/projections/settings');
const Commands = require('./commands');
const ChatBot = require('./modules/chatBot');
const ViewerProj = require('./viewer/decisionProjection');
const StreamProj = require('./stream/decisionProjection');
const CreditsProj = require('./projections/credits');

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

  const viewerSnapshotTaker = SnapshotTaker(eventStore, snapshotStore, 'viewer', ViewerProj);
  bus.subscribe('viewer', viewerSnapshotTaker.onEvent);
  const viewerStore = AggregateEventStore(eventStore, snapshotStore, 'viewer', ViewerProj);

  const streamSnapshotTaker = SnapshotTaker(eventStore, snapshotStore, 'stream', StreamProj);
  bus.subscribe('stream', streamSnapshotTaker.onEvent);
  const streamStore = AggregateEventStore(eventStore, snapshotStore, 'stream', StreamProj);

  const settings = SettingsProj(bus);
  const displayNames = DisplayNames(bus);
  const credits = CreditsProj(bus, displayNames);
  const achievementAlert = AchievementAlert(bus, settings, displayNames);
  const viewersAchievements = ViewersAchievements(bus);
  const commands = Commands(displayNames, viewersAchievements);
  ChatBot(bus, commands);

  const init = async () => {
    const query = fs.readFileSync('db/schema.sql').toString();
    await db.query(query);
    await snapshotStore.empty();
    const eventsStream = await eventStore.getEverything();
    await new Promise((resolve) => {
      eventsStream.pipe(replayWritable(bus)).on('finish', resolve);
    });
    log.info('replayed all events');
    await Promise.all([
      viewerSnapshotTaker.refreshAll(),
      streamSnapshotTaker.refreshAll(),
    ]);
  };

  return {
    init,
    eventStore,
    viewerStore,
    streamStore,
    achievementAlert,
    viewersAchievements,
    displayNames,
    settings,
    credits,
  };
};
