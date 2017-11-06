const EventStore = require('./eventStore');
const Bus = require('./bus');
const showAchievement = require('./apis/showAchievement');
const sendChatMessage = require('./apis/sendChatMessage');
const achievementAlertModule = require('./modules/achievementAlert');
const achievementModule = require('./modules/achievement');
const viewersModule = require('./modules/viewers');
const commandsModule = require('./modules/commandCommands');
const succesModule = require('./modules/commandSucces');
const DisplayNames = require('./viewer/projections/displayName');
const ViewersAchievements = require('./viewer/projections/achievements');
const achievementDefinitions = require('./achievementDefinitions');

module.exports = (storage, db) => {
  const store = EventStore(db);
  const bus = Bus(store);
  const viewers = viewersModule(storage);
  const achievementAlert = achievementAlertModule(storage, showAchievement);
  const achievement = achievementModule(storage, achievementAlert.display, viewers.getDisplayName);
  const commands = commandsModule(sendChatMessage);
  const succes = succesModule(achievement.get, sendChatMessage);
  const displayNames = DisplayNames(bus);
  const viewersAchievements = ViewersAchievements(bus);

  const init = () => store.getAll().then((eventsHistory) => {
    const replays = eventsHistory.map(bus.replay);
    return replays.reduce((prev, cur) => prev.then(cur), Promise.resolve());
  });

  bus.subscribe('viewer', (event, isReplay) => {
    if (event.type === 'got-achievement' && !isReplay) {
      return new Promise((resolve) => {
        achievementAlert.display({
          achievement: event.achievement,
          text: achievementDefinitions[event.achievement],
          username: displayNames.get(event.id),
        }, () => resolve());
      });
    }
    return Promise.resolve();
  });

  return {
    init,
    achievement,
    viewers,
    commands,
    succes,
    achievementAlert,
    db,
    store,
    bus,
    viewersAchievements,
  };
};
