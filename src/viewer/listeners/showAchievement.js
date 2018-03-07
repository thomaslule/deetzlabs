const showAchievement = require('../../apis/showAchievement');
const { gotAchievement } = require('../events').eventsTypes;
const achievements = require('../achievements');
const getDisplayName = require('../projections/displayNames').get;
const { getAchievementVolume } = require('../../settings/projections/settings');
const { log } = require('../../logger');

module.exports = closet => async (event) => {
  try {
    if (event.aggregate === 'viewer' && event.type === gotAchievement) {
      const a = achievements[event.achievement];
      const displayName = getDisplayName(await closet.getProjection('displayNames'), event.id);
      const volume = getAchievementVolume(await closet.getProjection('settings'));
      await showAchievement(displayName, a.name, a.text, volume);
    }
  } catch (err) {
    log.error(err);
  }
};
