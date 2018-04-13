const projection = require('./projection').default;
const routes = require('./routes');

module.exports = (closet) => {
  closet.registerProjection('credits', ['viewer', 'stream'], projection);

  return {
    routes: routes(closet),
  };
};
