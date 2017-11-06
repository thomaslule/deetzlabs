const storage = require('node-persist');
const deetzlabs = require('../../deetzlabs');
const httpServer = require('../../httpServer');

module.exports = (db) => {
  storage.initSync({
    dir: './.node-persist/test_storage',
  });
  storage.clearSync();
  const dl = deetzlabs(storage, db);
  return dl.init()
    .then(() => {
      const app = httpServer(dl);
      return { storage, app };
    });
};
