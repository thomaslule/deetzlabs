const { log } = require('../logger');

module.exports = (closet) => {
  closet.onEvent((e) => { log.info('Event happened: %s %s %s', e.aggregate, e.id, e.type); });
  return closet;
};
