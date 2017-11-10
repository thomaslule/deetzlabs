const projection = (eventsHistory) => {
  const reducer = (currentState, event) => {
    if (event.displayName) {
      return { ...currentState, [event.id]: event.displayName };
    }
    if (!currentState[event.id]) {
      return { ...currentState, [event.id]: event.id };
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

  const getAll = () => p.getState();

  return { get, getAll };
};
