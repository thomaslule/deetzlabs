const Channel = require('twitch-channel');
const proxy = require('express-http-proxy');

const { log } = require('./logger');

module.exports = (options) => {
  const bot = Channel({
    channel: options.channel,
    username: options.bot_name,
    token: options.bot_token,
    client_id: options.client_id,
    client_secret: options.client_secret,
    callback_url: `${options.self_url}/twitch-callback`,
    port: options.webhook_port,
    secret: options.secret,
    logger: log,
  });

  const streamer = Channel({
    channel: options.channel,
    username: options.channel,
    token: options.streamer_token,
    activate_polling: false,
    activate_webhook: false,
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

  const disconnect = async () => {
    await Promise.all([
      bot.disconnect(),
      streamer.disconnect(),
    ]);
  };

  const getProxy = () => proxy(`http://localhost:${options.webhook_port}`);

  return {
    say, on, connect, getProxy, disconnect,
  };
};
