const { eventsTypes } = require('../events');
const { log } = require('../../../logger');

module.exports = (commandParams, sendChatMessage) => async (event) => {
  try {
    if (event.type === eventsTypes.sentChatMessage
      && event.message.trim().toLowerCase() === commandParams.command) {
      await sendChatMessage(commandParams.answer);
    }
  } catch (err) {
    log.error(err);
  }
};
