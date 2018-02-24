const { Pool } = require('pg');
const config = require('config');
const { log } = require('./logger');
const httpServer = require('./httpServer');
const deetzlabs = require('./deetzlabs');

const start = async () => {
  try {
    const db = new Pool({ connectionString: config.get('db_url') });

    const app = deetzlabs(db);
    log.info('starting app...');
    await app.init();
    log.info('app started');
    const server = httpServer(app);

    server.listen(config.get('port'), 'localhost', () => {
      log.info(`listening on ${config.get('port')}`);
    });
  } catch (err) {
    console.error(err);
    log.error(err);
    process.exit(1);
  }
};

start();
