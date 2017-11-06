const request = require('request');
const logger = require('../logger');
const config = require('../config');

const handleErrors = (error, response) => {
  if (error) {
    logger.error(error);
    return error;
  } else if (!(`${response.statusCode}`).startsWith('2')) {
    logger.error('got a status code %s here', response.statusCode);
    return new Error(`request failed, status code was ${response.statusCode}`);
  }
  return null;
};

module.exports = (achievement, callback = () => {}) => {
  logger.info(`send show achievement command ${JSON.stringify(achievement)}`);
  request({
    uri: `${config.twitch_achievements.url}/achievement`,
    method: 'POST',
    json: achievement,
  }, (error, response) => {
    const err = handleErrors(error, response);
    callback(err);
  });
};
