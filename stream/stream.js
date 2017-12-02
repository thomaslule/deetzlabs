const {
  eventsTypes,
  begun,
  ended,
} = require('./events');

const decisionProjection = (eventsHistory) => {
  const reducer = (currentState, event) => {
    if (event.type === eventsTypes.begun) {
      return { ...currentState, broadcasting: true };
    } else if (event.type === eventsTypes.ended) {
      return { ...currentState, broadcasting: false };
    }
    return currentState;
  };

  let state = eventsHistory.reduce(reducer, { broadcasting: false });

  const apply = (event) => {
    state = reducer(state, event);
  };

  const getState = () => state;

  return { apply, getState };
};

module.exports = (eventsHistory) => {
  const decProj = decisionProjection(eventsHistory);

  const dispatchAndApply = async (bus, event) => {
    await bus.dispatch(event);
    decProj.apply(event);
  };

  const begin = async (bus) => {
    if (decProj.getState().broadcasting) {
      throw new Error('bad_request already broadcasting');
    }
    await dispatchAndApply(bus, begun());
  };

  const end = async (bus) => {
    if (!decProj.getState().broadcasting) {
      throw new Error('bad_request not broadcasting');
    }
    await dispatchAndApply(bus, ended());
  };

  return {
    begin,
    end,
  };
};
