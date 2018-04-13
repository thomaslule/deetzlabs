const { eventsTypes } = require('../events');
const { log } = require('../../../logger');

module.exports = sendChatMessage => async (event) => {
  try {
    if (event.type === eventsTypes.sentChatMessage && event.message.trim().toLowerCase() === '!commands') {
      await sendChatMessage('Moi j\'ai qu\'une commande c\'est !succès');
    }
  } catch (err) {
    log.error(err);
  }
};
