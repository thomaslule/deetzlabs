const { Pool } = require('pg');
const config = require('config');
const { log } = require('./logger');
const httpServer = require('./httpServer');
const deetzlabs = require('./deetzlabs');

const db = new Pool({ connectionString: config.get('db_url') });

const app = deetzlabs(db);
app.init()
  .then(() => {
    const server = httpServer(app);

    server.listen(config.get('port'), 'localhost', () => {
      log.info(`listening on ${config.get('port')}`);
    });
  })
  .catch((err) => {
    console.error(err);
    log.error(err);
    db.end();
    process.exit(1);
  });
