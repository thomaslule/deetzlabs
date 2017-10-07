const storage = require('node-persist');
const logger = require('./logger');
const httpServer = require('./httpServer');
const config = require('./config');
const deetzlabs = require('./deetzlabs');

storage.initSync({
  stringify: output => JSON.stringify(output, null, 2),
});

const server = httpServer(deetzlabs(storage));

server.listen(config.server_port, () => {
  logger.info(`listening on ${config.server_port}`);
});
