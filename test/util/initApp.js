const deetzlabs = require('../../deetzlabs');
const httpServer = require('../../httpServer');

module.exports = (db) => {
  const dl = deetzlabs(db);
  return dl.init()
    .then(() => httpServer(dl));
};
