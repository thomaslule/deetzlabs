const { EventEmitter } = require('events');
const TwitchHelix = require('twitch-helix');
const tmi = require('tmi.js');
const poll = require('./poll');

const defaultOptions = {
  channel: null,
  username: null,
  token: null,
  poll: true,
  clientId: null,
  clientSecret: null,
  logger: console,
};

const tmiEvents = ['action', 'ban', 'chat', 'cheer', 'clearchat', 'connected', 'connecting', 'disconnected', 'emoteonly', 'emotesets', 'followersonly', 'hosted', 'hosting', 'join', 'logon', 'message', 'mod', 'mods', 'notice', 'part', 'ping', 'pong', 'r9kbeta', 'reconnect', 'resub', 'roomstate', 'serverchange', 'slowmode', 'subscribers', 'subscription', 'timeout', 'unhost', 'unmod', 'whisper'];

module.exports = (options = {}) => {
  const opts = { ...defaultOptions, ...options };
  const bus = new EventEmitter();

  const helix = new TwitchHelix({
    clientId: options.clientId,
    clientSecret: options.clientSecret,
  });

  // get current broadcasted game or null if not broadcasting
  const fetchBroadcast = async () => {
    const stream = await helix.getStreamInfoByUsername(options.channel);
    if (stream) {
      const game = await helix.sendHelixRequest(`games?id=${stream.game_id}`);
      return game[0].name;
    }
    return null;
  };

  const onBroadcastChange = (currentGame, previousGame) => {
    if (previousGame && currentGame) bus.emit('stream-change-game', currentGame);
    else if (currentGame) bus.emit('stream-begin', currentGame);
    else bus.emit('stream-end');
  };

  const pollBroadcast = poll(fetchBroadcast, onBroadcastChange, {
    auto_start: false,
    interval: 5000,
  });

  const TmiClient = tmi.client;
  const user = new TmiClient({
    options: { debug: false },
    connection: { reconnect: true },
    identity: {
      username: opts.username,
      password: opts.token,
    },
    channels: [`#${opts.channel}`],
  });
  tmiEvents.forEach((event) => {
    user.on(event, (...args) => bus.emit(event, ...args));
  });

  const on = (event, handler) => bus.on(event, handler);

  const connect = async () => {
    await user.connect();
    if (opts.poll) {
      pollBroadcast.start();
    }
  };

  const disconnect = async () => {
    await user.disconnect();
    if (opts.poll) {
      pollBroadcast.stop();
    }
  };

  const say = (message) => {
    user.say(`#${opts.channel}`, message);
  };

  return {
    on, connect, disconnect, say,
  };
};
