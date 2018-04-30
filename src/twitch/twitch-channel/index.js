const { EventEmitter } = require('events');
const TwitchHelix = require('twitch-helix');
const kraken = require('twitch-api-v5');
const tmi = require('tmi.js');
const { promisify } = require('util');
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
  kraken.clientID = options.clientId;
  const krakenTopClips = promisify(kraken.clips.top);

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
  });

  const fetchTopClipper = async () => {
    const res = await krakenTopClips({ channel: opts.channel, period: 'week', limit: 1 });
    if (res.clips.length > 0) {
      return res.clips[0].curator.name;
    }
    return null;
  };

  const onTopClipperChange = (topClipper) => {
    if (topClipper !== null) {
      bus.emit('top-clipper-change', topClipper);
    }
  };

  const pollTopClipper = poll(fetchTopClipper, onTopClipperChange, {
    auto_start: false,
    interval: 60 * 60 * 1000,
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
      pollTopClipper.start();
    }
  };

  const disconnect = async () => {
    await user.disconnect();
    if (opts.poll) {
      pollBroadcast.stop();
      pollTopClipper.stop();
    }
  };

  const say = (message) => {
    user.say(`#${opts.channel}`, message);
  };

  return {
    on, connect, disconnect, say,
  };
};
