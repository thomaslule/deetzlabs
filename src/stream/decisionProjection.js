const { eventsTypes } = require('./events');

module.exports = (state = { broadcasting: false, game: '' }, event) => {
  if (event.type === eventsTypes.begun) {
    return { ...state, broadcasting: true, game: event.game };
  } else if (event.type === eventsTypes.changedGame) {
    return { ...state, game: event.game };
  } else if (event.type === eventsTypes.ended) {
    return { ...state, broadcasting: false };
  }
  return state;
};
