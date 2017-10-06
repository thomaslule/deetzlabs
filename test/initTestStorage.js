const storage = require('node-persist');

module.exports = () => {
  storage.initSync({
    dir: './.node-persist/test_storage',
  });
  storage.clearSync();
  return storage;
};
