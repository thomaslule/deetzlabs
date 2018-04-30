const { eventsTypes } = require('../events');

module.exports = (state = null, event) => {
  if (event.type === eventsTypes.becameTopClipper) {
    return event.id;
  }
  return state;
};
