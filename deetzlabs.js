const EventStore = require('./eventStore');
const Bus = require('./bus');
const showAchievement = require('./apis/showAchievement');
const sendChatMessage = require('./apis/sendChatMessage');
const achievementAlertModule = require('./modules/achievementAlert');
const DisplayNames = require('./viewer/projections/displayName');
const ViewersAchievements = require('./viewer/projections/achievements');
const achievementDefinitions = require('./achievementDefinitions');
const isCommand = require('./util/isCommand');

module.exports = (storage, db) => {
  const store = EventStore(db);
  const bus = Bus(store);
  const achievementAlert = achievementAlertModule(storage, showAchievement);
  const displayNames = DisplayNames(bus);
  const viewersAchievements = ViewersAchievements(bus);

  const init = () => store.getAll().then((eventsHistory) => {
    const replays = eventsHistory.map(bus.replay);
    return replays.reduce((prev, cur) => prev.then(cur), Promise.resolve());
  });

  bus.subscribe('viewer', (event, isReplay) => {
    if (!isReplay && event.type === 'got-achievement') {
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

  bus.subscribe('viewer', (event, isReplay) => {
    if (
      !isReplay
      && event.type === 'sent-chat-message'
      && (isCommand('!succès', event.message) || isCommand('!succes', event.message) || isCommand('!success', event.message))) {
      const displayName = displayNames.get(event.id);
      const achievements = viewersAchievements
        .getForViewer(event.id);
      const message = achievements.length > 0 ?
        `Bravo ${displayName} pour tes succès : ${achievements.join(', ')} !`
        : `${displayName} n'a pas encore de succès, déso.`;
      sendChatMessage(message);
    }
    return Promise.resolve();
  });

  bus.subscribe('viewer', (event, isReplay) => {
    if (
      !isReplay
      && event.type === 'sent-chat-message'
      && (event.message.trim().toLowerCase() === '!commands')) {
      sendChatMessage('Moi j\'ai qu\'une commande c\'est !succès');
    }
    return Promise.resolve();
  });

  return {
    init,
    achievementAlert,
    db,
    store,
    bus,
    viewersAchievements,
    displayNames,
  };
};
