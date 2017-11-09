const request = require('request');
const config = require('config');
const { log } = require('../logger');

module.exports = (message) => {
  log.info('send chat message command', message);
  request({
    uri: config.get('bot_url'),
    method: 'POST',
    json: { message },
  }, (error, response) => {
    if (error) {
      log.error(error);
    } else if (!(`${response.statusCode}`).startsWith('2')) {
      log.error('got a status code %s when sending chat message request', response.statusCode);
    }
  });
};
