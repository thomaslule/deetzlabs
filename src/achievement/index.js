const projection = require('./projection');
const Listener = require('./listener');

module.exports = (closet) => {
  const listener = Listener(closet);
  closet.registerProjection('achievements', ['viewer'], projection, {
    onChange: listener.distribute,
  });
  closet.onEvent(listener.show);
};
