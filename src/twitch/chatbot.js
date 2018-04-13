const config = require('config');
const tmi = require('tmi.js');

module.exports = (name, token) =>
  new tmi.client({
    options: { debug: false },
    connection: { reconnect: true },
    identity: {
      username: name,
      password: token,
    },
    channels: [`#${config.get('channel')}`],
  });
