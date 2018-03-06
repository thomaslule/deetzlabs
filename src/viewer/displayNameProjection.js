const { eventsTypes } = require('./events');

const proj = (state = {}, event) => {
  if (event.type === eventsTypes.sentChatMessage && event.displayName) {
    return { ...state, [event.id]: event.displayName };
  }
  return state;
};

const get = (state, id) => (state[id] ? state[id] : id);

module.exports = {
  default: proj,
  get,
};
