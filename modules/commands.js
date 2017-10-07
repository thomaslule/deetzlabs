const commands = sendMessage => ({
  receiveMessage: (user, message) => {
    if (message.trim() === '!commands') {
      sendMessage('Moi j\'ai qu\'une commande c\'est !succès');
    }
  },
});

module.exports = commands;
