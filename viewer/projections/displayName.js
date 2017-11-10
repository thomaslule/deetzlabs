const mapValues = require('lodash/mapValues');
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

  const get = id => p.getState()[id] || id;

  const getAll = () => mapValues(p.getState(), (displayName, id) => displayName || id);

  return { get, getAll };
};
