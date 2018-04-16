const { EventEmitter } = require('events');
const tmi = require('tmi.js');
const Poller = require('./poller');

const defaultOptions = {
  channel: null,
  username: null,
  token: null,
  clientId: null,
  clientSecret: null,
  logger: console,
};

module.exports = (options = {}) => {
  const opts = { ...defaultOptions, ...options };
  const bus = new EventEmitter();
  const poller = Poller(bus, opts);
  const user = new tmi.client({
    options: { debug: false },
    connection: { reconnect: true },
    identity: {
      username: opts.username,
      password: opts.token,
    },
    channels: [`#${opts.channel}`],
  });
  user.on('chat', (...args) => bus.emit('chat', ...args));

  const on = (event, handler) => bus.on(event, handler);

  const connect = async () => {
    await user.connect();
    poller.poll();
    setInterval(poller.poll, 5 * 60 * 1000); // poll every 5 minutes
  };

  const say = (message) => {
    user.say(`#${opts.channel}`, message);
  };

  return { on, connect, say };
};
