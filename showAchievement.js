const request = require('request');
const clone = require('clone');
const logger = require('./logger');
const config = require('./config');

module.exports = (achievement, callback) => {
  logger.info('send show achievement command', achievement);
  const requestBody = clone(achievement);
  requestBody.secret = config.twitch_achievements_secret;
  request({
    uri: 'http://localhost:3101/achievement',
    method: 'POST',
    json: requestBody,
  }, (error) => {
    if (error) {
      logger.error(error);
    }
    callback(error);
  });
};
