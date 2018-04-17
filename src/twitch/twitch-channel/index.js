const { EventEmitter } = require('events');
const tmi = require('tmi.js');
const Poller = require('./poller');

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

const noop = () => {};

module.exports = (options = {}) => {
  const opts = { ...defaultOptions, ...options };
  const bus = new EventEmitter();
  let intervalId;

  const poller = opts.poll ? Poller(bus, opts) : { poll: noop };

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
    intervalId = setInterval(poller.poll, 5 * 60 * 1000); // poll every 5 minutes
    poller.poll();
  };

  const disconnect = async () => {
    await user.disconnect();
    clearInterval(intervalId);
  };

  const say = (message) => {
    user.say(`#${opts.channel}`, message);
  };

  return {
    on, connect, disconnect, say,
  };
};