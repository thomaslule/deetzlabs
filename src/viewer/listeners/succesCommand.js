const sendChatMessage = require('../../apis/sendChatMessage');
const { eventsTypes } = require('../events');
const { log } = require('../../logger');
const { isCommand } = require('../../util');
const displayNamesProjection = require('../projections/displayNames');
const distributedAchievementsProjection = require('../projections/distributedAchievements');
const achievements = require('../achievements');

module.exports = closet => async (event) => {
  try {
    if (event.type === eventsTypes.sentChatMessage && (
      isCommand('!succès', event.message) || isCommand('!succes', event.message)
    )) {
      const displayName = displayNamesProjection.get(await closet.getProjection('displayNames'), event.id);
      const viewerAchievements = distributedAchievementsProjection.getForViewer(
        await closet.getProjection('distributedAchievements'),
        event.id,
      );
      const message = viewerAchievements.length > 0 ?
        `Bravo ${displayName} pour tes succès : ${viewerAchievements.map(a => achievements[a].name).join(', ')} !`
        : `${displayName} n'a pas encore de succès, déso.`;
      await sendChatMessage(message);
    }
  } catch (err) {
    log.error(err);
  }
};
