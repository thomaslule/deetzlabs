const request = require('request');
const config = require('../config');
const logger = require('../logger');

module.exports = (message) => {
  logger.info('send chat message command', message);
  request({
    uri: `${config.twitch_bot.url}/send_message`,
    method: 'POST',
    json: { message },
  }, (error, response) => {
    if (error) {
      logger.error(error);
    } else if (!(`${response.statusCode}`).startsWith('2')) {
      logger.error('got a status code %s when sending chat message request', response.statusCode);
    }
  });
};
