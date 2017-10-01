const logger = require('./logger');

const viewers = (persist) => {
  const storeName = 'viewers';
  return {
    received: (name, callback) => {
      const stored = persist.getItemSync(storeName) || [];
      if (!stored.includes(name)) {
        stored.push(name);
        persist.setItemSync(storeName, stored);
        callback();
      } else {
        logger.info('viewer %s already exists', name);
        callback();
      }
    },
    get: () => persist.getItemSync(storeName) || [],
  };
};

module.exports = viewers;
