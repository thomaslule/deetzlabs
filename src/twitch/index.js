const EventEmitter = require('events');
const config = require('config');
const Poller = require('./poller');
const Webhook = require('./webhook');
const Chatbot = require('./chatbot');
const Router = require('./router');

/*
const Channel = require('./twitch-channel');

module.exports = () => {
  const bot = Channel({
    channel: config.get('channel'),
    username: config.get('bot'),
    token: config.get('botToken'),
  });

  const streamer = Channel({
    channel: config.get('channel'),
    username: config.get('channel'),
    token: config.get('streamerToken'),
  });

  bot.on('start-stream', () => {
    streamer.connect();
  });

  bot.on('end-stream', () => {
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

  const connect = () => {
    bot.connect();
    if (bot.broadcasting()) {
      streamer.connect();
    }
  };

  return { say, on, connect };
};
*/

module.exports = () => {
  const bus = new EventEmitter();
  const poller = Poller(bus);
  const webhook = Webhook(bus);

  const bot = Chatbot(config.bot_name, config.bot_token);
  const streamer = Chatbot(config.channel, config.streamer_token);
  const router = Router(bus);

  const connect = async () => {
    await bot.connect();
    poller.poll();
    setInterval(poller.poll, 5 * 60 * 1000); // poll every 5 minutes
    webhook.refresh();
    setInterval(webhook.refresh, 24 * 60 * 60 * 1000); // refresh webhooks every 24h
  };

  const getRouter = () => router;

  const sendChatMessage = (message) => {
    bot.say(`#${config.channel}`, message);
  };

  const on = (event, listener) => {
    if (event === 'hosted') {
      streamer.on(event, listener);
    } else if (event === 'stream-begin') {
      bus.on(event, listener);
    } else if (event === 'stream-end') {
      bus.on(event, listener);
    } else if (event === 'stream-change-game') {
      bus.on(event, listener);
    } else if (event === 'follow') {
      bus.on(event, listener);
    } else {
      bot.on(event, listener);
    }
  };

  return {
    connect, getRouter, sendChatMessage, on,
  };
};
