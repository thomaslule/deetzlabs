const sendChatMessage = require('../apis/sendChatMessage');
const { eventsTypes } = require('../viewer/events');

module.exports = (bus, commands) => {
  const receiveEvent = (event) => {
    const messagesToSend = [];
    if (event.type === eventsTypes.sentChatMessage) {
      const messages = commands.filter(c => c.condition(event.message))
        .map(c => c.messageToSend(event.id, event.message));
      messagesToSend.push(...messages);
    }
    return Promise.all(messagesToSend.map(message => sendChatMessage(message)));
  };

  bus.subscribe('viewer', async (event, isReplay) => {
    if (!isReplay) {
      await receiveEvent(event);
    }
  });
};
