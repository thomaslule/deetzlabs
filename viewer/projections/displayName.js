const { eventsTypes } = require('../events');

const projection = (eventsHistory) => {
  const reducer = (currentState, event) => {
    if (event.type === eventsTypes.changedDisplayName) {
      return { ...currentState, [event.id]: event.displayName };
    }
    return currentState;
  };

  let state = eventsHistory.reduce(reducer, {});

  const apply = (event) => {
    state = reducer(state, event);
  };

  const getState = () => state;

  return { apply, getState };
};

module.exports = (bus) => {
  const p = projection([]);
  bus.subscribe('viewer', p.apply);

  const get = viewer => p.getState()[viewer] || viewer;

  const getAll = () => p.getState();

  return { get, getAll };
};
