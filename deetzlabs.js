const fs = require('fs');
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
  configureLogger();
  const store = EventStore(db);
  const bus = Bus(store);
  const settings = Settings(bus);
  const displayNames = DisplayNames(bus);
  const achievementAlert = AchievementAlert(bus, settings, displayNames);
  const viewersAchievements = ViewersAchievements(bus);
  succesCommand(bus, displayNames, viewersAchievements);
  commandsCommand(bus);

  const init = () => {
    const query = fs.readFileSync('db/schema.sql').toString();
    return db.query(query)
      .then(() => store.getAllForAllAggregates())
      .then((eventsHistory) => {
        let promise = Promise.resolve();
        eventsHistory.forEach((e) => {
          promise = promise.then(() => bus.replay(e));
        });
        return promise;
      });
  };


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
