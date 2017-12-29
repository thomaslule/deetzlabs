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
    const promises = interestedListeners.map(listener => listener(event, isReplay));
    return Promise.all(promises);
  };

  const dispatch = async (event) => {
    log.info('Event happened: %s %s %s', event.aggregate, event.id, event.type);
    return sendEventToListeners(event, false);
  };

  const replay = event => sendEventToListeners(event, true);

  return { subscribe, dispatch, replay };
};
