const request = require('request-promise-native');
const config = require('config');
const { log } = require('../logger');

module.exports = (credits) => {
  log.info('show credits');
  return request({
    method: 'POST',
    uri: config.get('show_credits_url'),
    json: credits,
  });
};
