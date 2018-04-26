const { eventsTypes } = require('../events');
const { log } = require('../../../logger');
const displayNamesProjection = require('../projections/displayNames');
const distributedAchievementsProjection = require('../projections/distributedAchievements');

module.exports = (closet, achievements, commandParams, sendChatMessage) => async (event) => {
  try {
    if (event.type === eventsTypes.sentChatMessage
      && event.message.trim().toLowerCase() === commandParams.command) {
      const displayName = displayNamesProjection.get(await closet.getProjection('displayNames'), event.id);
      const viewerAchievements = distributedAchievementsProjection.getForViewer(
        await closet.getProjection('distributedAchievements'),
        event.id,
      );
      const message = viewerAchievements.length > 0 ?
        commandParams.answer.replace('%USER%', displayName).replace('%ACHIEVEMENTS%', viewerAchievements.map(a => achievements[a].name).join(', '))
        : commandParams.answer_none.replace('%USER%', displayName);
      await sendChatMessage(message);
    }
  } catch (err) {
    log.error(err);
  }
};
