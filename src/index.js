const { EventEmitter } = require('events');
const { Pool } = require('pg');
const socketio = require('socket.io');
const { configureLogger, log } = require('./logger');
const closetStorage = require('./storage');
const configureCloset = require('./domain');
const viewerEvents = require('./domain/viewer/events').eventsTypes;
const streamEvents = require('./domain/stream/events').eventsTypes;
const Twitch = require('./twitch');
const Server = require('./server');
const Api = require('./api');
const Widgets = require('./widgets');
const Admin = require('./admin');
const addListeners = require('./addListeners');

const defaultOptions = {
  port: 3100,
  db_url: 'postgresql://postgres:admin@localhost:5432/deetzlabs',
  channel: '',
  client_id: '',
  client_secret: '',
  streamer_token: '',
  bot_name: '',
  bot_token: '',
  secret: '',
  self_url: 'http://localhost',
  webhook_port: 3333,
  achievements_command: {
    command: '!achievements',
    answer: 'Congratulations %USER% for your achievements: %ACHIEVEMENTS%',
    answer_none: '%USER% doesn\'t have any achievement but their time will come!',
  },
  commands_command: {
    command: '!commands',
    answer: 'Say !achievements to see your current achievements',
  },
  protect_api: true,
  logins: {
    test: 'n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg=', // test
  },
  log_to_console: true,
  log_to_file: true,
  achievements: {
    testing: {
      name: 'Testing',
      text: '%USER% tests something',
      reducer: () => ({ distribute: false }),
    },
  },
  widgets_folder: null,
};

const Deetzlabs = (options = {}) => {
  const opts = {
    ...defaultOptions,
    ...options,
  };
  const db = new Pool({ connectionString: opts.db_url });
  const twitch = Twitch(opts);
  const bus = new EventEmitter();
  const closet = configureCloset({
    closetOptions: { storage: closetStorage(db), snapshotEvery: 50, logger: log },
    achievements: opts.achievements,
    sendChatMessage: twitch.say,
    showAchievement: (...args) => { bus.emit('show', ...args); },
    achievements_command: opts.achievements_command,
    commands_command: opts.commands_command,
  });
  addListeners(twitch, closet);
  const widgets = Widgets(opts);
  const api = Api(closet, opts);
  const admin = Admin();
  const server = Server(api, widgets, admin, twitch.getProxy());

  const start = async () => {
    try {
      configureLogger(opts);
      await closet.rebuild();
      await twitch.connect();
      const socket = socketio.listen(server);
      bus.on('show', (achievement, text, username, volume) => {
        socket.emit('achievement', {
          achievement, username, text, volume,
        });
      });

      server.listen(opts.port, () => {
        log.info(`listening on ${opts.port}`);
      });
    } catch (err) {
      console.error(err);
      log.error(err);
      process.exit(1);
    }
  };

  const stop = async () => {
    await twitch.disconnect();
  };

  return { start, stop };
};

module.exports = {
  default: Deetzlabs,
  viewerEvents,
  streamEvents,
};
