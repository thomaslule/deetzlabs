const pickBy = require('lodash/pickBy');
const showAchievement = require('../apis/showAchievement');
const { gotAchievement } = require('../viewer/events').eventsTypes;
const achievements = require('./achievements');
const log = require('../logger');

module.exports = (closet) => {
  const distribute = (achievementsProj, event) => {
    if (event.aggregate === 'viewer') {
      const viewerProj = achievementsProj[event.id];
      Object.keys(pickBy(viewerProj.achievements, a => a.distribute))
        .filter(a => !viewerProj.achievementsReceived.includes(a))
        .forEach(async (achievement) => {
          try {
            closet.handleCommand('viewer', event.id, 'giveAchievement', { achievement });
          } catch (err) {
            log.error(err);
          }
        });
    }
  };

  const show = async (event) => {
    try {
      if (event.aggregate === 'viewer' && event.type === gotAchievement) {
        const a = achievements[event.achievement];
        showAchievement(event.id, a.name, a.text, 0.5);
      }
    } catch (err) {
      log.error(err);
    }
  };

  return { distribute, show };
};
