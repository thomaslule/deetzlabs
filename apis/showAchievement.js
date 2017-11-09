const request = require('request-promise-native');
const logger = require('../logger');
const config = require('../config');

module.exports = (viewerName, achievementName, achievementText, volume) => {
  logger.info('show achievement %s for %s', achievementName, viewerName);
  return request({
    method: 'POST',
    uri: `${config.twitch_achievements.url}/achievement`,
    json: true,
    body: {
      viewerName,
      achievementName,
      achievementText,
      volume,

    },
  });
};
