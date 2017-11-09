const { MongoClient } = require('mongodb');
const config = require('config');
const logger = require('./logger');
const httpServer = require('./httpServer');
const deetzlabs = require('./deetzlabs');

let app;

MongoClient.connect(config.get('db_url'), {})
  .then((db) => {
    app = deetzlabs(db);
    return app.init();
  })
  .then(() => {
    const server = httpServer(app);

    server.listen(config.get('port'), () => {
      logger.info(`listening on ${config.get('port')}`);
    });
  })
  .catch((err) => {
    console.error(err);
    logger.error(err);
    process.exit(1);
  });
