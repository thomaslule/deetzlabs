const Closet = require('event-closet').default;
const { log } = require('../logger');

module.exports = () => {
  const closet = Closet();
  closet.onEvent((e) => { log.info('Event happened: %s %s %s', e.aggregate, e.id, e.type); });
  return closet;
};
