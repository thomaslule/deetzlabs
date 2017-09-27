const request = require('request');

module.exports = (achievement, callback) => {
  request({
    uri: 'http://localhost:3101/achievement',
    method: 'POST',
    json: achievement,
  }, callback);
};
