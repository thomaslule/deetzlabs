const isCommand = require('../util/isCommand');
const sendChatMessage = require('../apis/sendChatMessage');
const achievements = require('../achievements');

module.exports = (bus, displayNames, viewersAchievements) => {
  bus.subscribe('viewer', (event, isReplay) => {
    if (
      !isReplay
      && event.type === 'sent-chat-message'
      && (isCommand('!succès', event.message) || isCommand('!succes', event.message) || isCommand('!success', event.message))) {
      const displayName = displayNames.get(event.id);
      const viewerAchievements = viewersAchievements.getForViewer(event.id);
      const message = viewerAchievements.length > 0 ?
        `Bravo ${displayName} pour tes succès : ${viewerAchievements.map(a => achievements[a].name).join(', ')} !`
        : `${displayName} n'a pas encore de succès, déso.`;
      sendChatMessage(message);
    }
    return Promise.resolve();
  });
};
