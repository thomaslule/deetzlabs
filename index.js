const { MongoClient } = require('mongodb');
const config = require('config');
const storage = require('node-persist');
const logger = require('./logger');
const httpServer = require('./httpServer');
const config2 = require('./config');
const deetzlabs = require('./deetzlabs');

storage.initSync({
  stringify: output => JSON.stringify(output, null, 2),
});

let app;
let db;

MongoClient.connect(config.get('db_url'), {})
  .then((db2) => {
    db = db2;
    app = deetzlabs(storage, db);
    return app.init();
  })
  .then(() => {
    const server = httpServer(deetzlabs(storage, db));

    server.listen(config2.server_port, () => {
      logger.info(`listening on ${config2.server_port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    logger.error(err);
    process.exit(1);
  });
