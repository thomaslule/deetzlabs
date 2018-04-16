const config = require('config');
const Channel = require('./twitch-channel');
const { log } = require('../logger');

module.exports = () => {
  const bot = Channel({
    channel: config.get('channel'),
    username: config.get('bot_name'),
    token: config.get('bot_token'),
    clientId: config.get('client_id'),
    clientSecret: config.get('client_secret'),
    logger: log,
  });

  const streamer = Channel({
    channel: config.get('channel'),
    username: config.get('channel'),
    token: config.get('streamer_token'),
    poll: false,
    logger: log,
  });

  bot.on('stream-begin', () => {
    streamer.connect();
  });

  bot.on('stream-end', () => {
    streamer.disconnect();
  });

  const on = (event, listener) => {
    if (event === 'hosted') {
      streamer.on(event, listener);
    } else {
      bot.on(event, listener);
    }
  };

  const say = (message) => {
    bot.say(message);
  };

  const connect = async () => {
    await bot.connect();
  };

  return { say, on, connect };
};
