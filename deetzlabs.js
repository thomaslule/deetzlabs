const { configureLogger } = require('./logger');
const EventStore = require('./eventStore');
const Bus = require('./bus');
const AchievementAlert = require('./modules/achievementAlert');
const DisplayNames = require('./viewer/projections/displayName');
const ViewersAchievements = require('./viewer/projections/achievements');
const Settings = require('./settings/projections/settings');
const succesCommand = require('./modules/succesCommand');
const commandsCommand = require('./modules/commandsCommand');

module.exports = (db) => {
  configureLogger(db);
  const store = EventStore(db);
  const bus = Bus(store);
  const settings = Settings(bus);
  const displayNames = DisplayNames(bus);
  const achievementAlert = AchievementAlert(bus, settings, displayNames);
  const viewersAchievements = ViewersAchievements(bus);
  succesCommand(bus, displayNames, viewersAchievements);
  commandsCommand(bus);

  const init = () =>
    store.getAllForAllAggregates()
      .then((eventsHistory) => {
        let promise = Promise.resolve();
        eventsHistory.forEach((e) => {
          promise = promise.then(() => bus.replay(e));
        });
        return promise;
      });

  return {
    init,
    db,
    store,
    bus,
    achievementAlert,
    viewersAchievements,
    displayNames,
    settings,
  };
};
