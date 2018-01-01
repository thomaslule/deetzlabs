const { log } = require('./logger');

module.exports = () => {
  const listeners = {};

  const subscribe = (aggregate, callback) => {
    if (!listeners[aggregate]) {
      listeners[aggregate] = [];
    }
    listeners[aggregate].push(callback);
  };

  const sendEventToListeners = (event, isReplay) => {
    const interestedListeners = listeners[event.aggregate] || [];
    interestedListeners.forEach(listener => listener(event, isReplay));
  };

  const dispatch = (event) => {
    log.info('Event happened: %s %s %s', event.aggregate, event.id, event.type);
    sendEventToListeners(event, false);
  };

  const replay = event => sendEventToListeners(event, true);

  return { subscribe, dispatch, replay };
};
