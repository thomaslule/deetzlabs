const projection = require('../../util/projection');

module.exports = (bus) => {
  const p = projection([], {}, (state, event) => {
    if (event.displayName) {
      return { ...state, [event.id]: event.displayName };
    }
    if (!state[event.id]) {
      return { ...state, [event.id]: event.id };
    }
    return state;
  });
  bus.subscribe('viewer', p.apply);

  const get = id => p.getState()[id] || id;

  const getAll = () => p.getState();

  return { get, getAll };
};
