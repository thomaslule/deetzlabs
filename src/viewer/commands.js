const events = require('./events');
const achievements = require('../achievement/achievements');

module.exports = {
  giveAchievement: (projection, { achievement }) => {
    if (projection.achievementsReceived.includes(achievement)) {
      throw new Error('bad_request user already has achievement');
    }
    if (!achievements[achievement]) {
      throw new Error('bad_request achievement doesnt exist');
    }
    return events.gotAchievement(achievement);
  },
  host: (projection, { nbViewers }) => events.hosted(nbViewers),
};
