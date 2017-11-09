const request = require('request-promise-native');
const config = require('config');
const logger = require('../logger');

module.exports = (viewerName, achievementName, achievementText, volume) => {
  logger.info('show achievement %s for %s', achievementName, viewerName);
  return request({
    method: 'POST',
    uri: config.get('show_achievement_url'),
    json: true,
    body: {
      viewerName,
      achievementName,
      achievementText,
      volume,

    },
  });
};
