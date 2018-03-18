const { log } = require('../../logger');

module.exports = closet => (achievementsProj, event) => {
  if (event.aggregate === 'viewer') {
    const viewerProj = achievementsProj[event.id];
    if (viewerProj) {
      Object.keys(viewerProj.achievements)
        .filter(a => viewerProj.achievements[a].distribute)
        .filter(a => !viewerProj.achievementsReceived.includes(a))
        .forEach(async (achievement) => {
          try {
            await closet.handleCommand('viewer', event.id, 'giveAchievement', { achievement });
          } catch (err) {
            log.error(err);
          }
        });
    }
  }
};
