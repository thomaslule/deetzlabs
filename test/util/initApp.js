const storage = require('node-persist');
const deetzlabs = require('../../deetzlabs');
const httpServer = require('../../httpServer');
const logger = require('../../logger');

module.exports = () => {
  logger.clear();
  storage.initSync({
    dir: './.node-persist/test_storage',
  });
  storage.clearSync();
  const app = httpServer(deetzlabs(storage));
  return { storage, app };
};
