const projection = require('../util/projection');
const { eventsTypes } = require('./events');

const defaultState = { broadcasting: false, game: '' };

module.exports = (eventsHistory, initState = defaultState) => projection(
  eventsHistory,
  initState,
  (state, event) => {
    if (event.type === eventsTypes.begun) {
      return { ...state, broadcasting: true, game: event.game };
    } else if (event.type === eventsTypes.changedGame) {
      return { ...state, game: event.game };
    } else if (event.type === eventsTypes.ended) {
      return { ...state, broadcasting: false };
    }
    return state;
  },
);
