const request = require('request');
const logger = require('./logger');

module.exports = (achievement, callback) => {
  logger.info('send show achievement command', achievement);
  request({
    uri: 'http://localhost:3101/achievement',
    method: 'POST',
    json: achievement,
  }, (error) => {
    if (error) {
      logger.error(error);
    }
    callback(error);
  });
};
