const sendChatMessage = require('../apis/sendChatMessage');

module.exports = (bus) => {
  bus.subscribe('viewer', (event, isReplay) => {
    if (
      !isReplay
      && event.type === 'sent-chat-message'
      && (event.message.trim().toLowerCase() === '!commands')) {
      return sendChatMessage('Moi j\'ai qu\'une commande c\'est !succès');
    }
    return Promise.resolve();
  });
};
