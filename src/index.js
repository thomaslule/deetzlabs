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

const Deetzlabs = (options) => {
  const db = new Pool({ connectionString: options.db_url });
  const twitch = Twitch(options);
  const bus = new EventEmitter();
  const closet = configureCloset({
    closetOptions: { storage: closetStorage(db), snapshotEvery: 50, logger: log },
    achievements: options.achievements,
    sendChatMessage: twitch.say,
    showAchievement: (...args) => { bus.emit('show', ...args); },
  });
  addListeners(twitch, closet);
  const widgets = Widgets(options);
  const api = Api(closet, options);
  const admin = Admin();
  const server = Server(api, widgets, admin);

  const start = async () => {
    try {
      configureLogger(options);
      await closet.rebuild();
      await twitch.connect();
      const socket = socketio.listen(server);
      bus.on('show', (achievement, text, username, volume) => {
        socket.emit('achievement', {
          achievement, username, text, volume,
        });
      });

      server.listen(options.port, () => {
        log.info(`listening on ${options.port}`);
      });
    } catch (err) {
      console.error(err);
      log.error(err);
      process.exit(1);
    }
  };

  return { start };
};

module.exports = {
  default: Deetzlabs, configureCloset, viewerEvents, streamEvents,
};
