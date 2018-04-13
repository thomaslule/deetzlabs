const { EventEmitter } = require('events');
const { Pool } = require('pg');
const config = require('config');
const { configureLogger, log } = require('./logger');
const closetStorage = require('./storage');
const Domain = require('./domain');
const Twitch = require('./twitch');
const server = require('./server');
const Api = require('./api');
const Widgets = require('./widgets');

module.exports = async () => {
  try {
    configureLogger();
    const db = new Pool({ connectionString: config.get('db_url') });
    const twitch = Twitch();
    const bus = new EventEmitter();
    const domain = Domain({
      closetOptions: { storage: closetStorage(db), snapshotEvery: 50, logger: log },
      sendChatMessage: twitch.sendChatMessage,
      showAchievement: (...args) => {
        bus.emit('show', ...args);
      },
    });
    await domain.rebuild();

    twitch.on('chat', async (channel, userstate, message, isSelf) => {
      try {
        if (isSelf) return;
        await domain.handleCommand('viewer', userstate.viewer, 'chatMessage', {
          message: userstate.message,
          displayName: userstate['display-name'],
        });
      } catch (error) {
        log.error(error);
      }
    });
    await twitch.connect();

    const widgets = Widgets(domain);
    bus.on('show', widgets.showAchievement);

    const api = Api(domain);

    const app = server(api, widgets.getRouter(), twitch.getRouter());
    app.listen(config.get('port'), () => {
      log.info(`listening on ${config.get('port')}`);
    });
  } catch (err) {
    console.error(err);
    log.error(err);
    process.exit(1);
  }
};
