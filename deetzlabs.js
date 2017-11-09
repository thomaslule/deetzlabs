const EventStore = require('./eventStore');
const Bus = require('./bus');
const AchievementAlert = require('./modules/achievementAlert');
const DisplayNames = require('./viewer/projections/displayName');
const ViewersAchievements = require('./viewer/projections/achievements');
const Settings = require('./settings/projections/settings');
const succesCommand = require('./modules/succesCommand');
const commandsCommand = require('./modules/commandsCommand');

module.exports = (db) => {
  const store = EventStore(db);
  const bus = Bus(store);
  const settingsProjection = Settings(bus);
  const displayNames = DisplayNames(bus);
  const achievementAlert = AchievementAlert(bus, settingsProjection, displayNames);
  const viewersAchievements = ViewersAchievements(bus);
  succesCommand(bus, displayNames, viewersAchievements);
  commandsCommand(bus);

  const init = () =>
    store.getAll()
      .then(eventsHistory =>
        eventsHistory
          .map(bus.replay)
          .reduce((prev, cur) => prev.then(cur), Promise.resolve()));

  return {
    init,
    achievementAlert,
    db,
    store,
    bus,
    viewersAchievements,
    displayNames,
    settingsProjection,
  };
};
