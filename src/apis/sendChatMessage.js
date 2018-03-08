const request = require('request-promise-native');
const config = require('config');
const { log } = require('../logger');

module.exports = (message) => {
  log.info('send chat message command', message);
  return request({
    method: 'POST',
    uri: config.get('bot_url'),
    json: { message },
  });
};
