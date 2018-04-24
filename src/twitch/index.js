const Channel = require('./twitch-channel');
const { log } = require('../logger');

module.exports = (options) => {
  const bot = Channel({
    channel: options.channel,
    username: options.bot_name,
    token: options.bot_token,
    clientId: options.client_id,
    clientSecret: options.client_secret,
    logger: log,
  });

  const streamer = Channel({
    channel: options.channel,
    username: options.channel,
    token: options.streamer_token,
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
