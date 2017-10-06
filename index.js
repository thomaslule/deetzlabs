const storage = require('node-persist');
const logger = require('./logger');
const httpServer = require('./httpServer');
const config = require('./config');

storage.initSync({
  stringify: output => JSON.stringify(output, null, 2),
});

const server = httpServer(storage);

server.listen(config.server_port, () => {
  logger.info(`listening on ${config.server_port}`);
});
