const Closet = require('event-closet').default;
const { Pool } = require('pg');
const closetStorage = require('./closet/storage');
const { log } = require('./logger');
const config = require('config');
const App = require('./app');

const start = async () => {
  let db;
  try {
    db = new Pool({ connectionString: config.get('db_url') });
    const closet = Closet({ storage: closetStorage(db), snapshotEvery: 50, logger: log });
    const app = App(closet);
    await closet.rebuild();

    app.listen(config.get('port'), 'localhost', () => {
      log.info(`listening on ${config.get('port')}`);
    });
  } catch (err) {
    console.error(err);
    log.error(err);
    await db.end();
    process.exit(1);
  }
};

start();
