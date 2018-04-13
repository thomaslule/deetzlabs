const projection = require('./projection').default;

module.exports = (closet) => {
  closet.registerProjection('credits', ['viewer', 'stream'], projection);
};
