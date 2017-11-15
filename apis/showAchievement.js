const request = require('request-promise-native');
const config = require('config');
const { log } = require('../logger');

module.exports = (viewerName, achievementName, achievementText, volume) => {
  log.info('show achievement %s for %s', achievementName, viewerName);
  return request({
    method: 'POST',
    uri: config.get('show_achievement_url'),
    json: {
      viewerName,
      achievementName,
      achievementText,
      volume,
    },
  });
};
