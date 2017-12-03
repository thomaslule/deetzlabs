module.exports = (eventsHistory, initialState, reducer) => {
  let state = eventsHistory.reduce(reducer, initialState);

  const apply = (event) => {
    state = reducer(state, event);
  };

  const getState = () => state;

  return { apply, getState };
};
