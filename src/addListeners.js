const { log } = require('./logger');

module.exports = (twitch, closet) => {
  twitch.on('chat', async (channel, userstate, message, isSelf) => {
    try {
      if (isSelf) return;
      await closet.handleCommand('viewer', userstate.username, 'chatMessage', {
        message,
        displayName: userstate['display-name'],
      });
    } catch (error) {
      log.error(error);
    }
  });

  twitch.on('stream-begin', async (game) => {
    try {
      await closet.handleCommand('stream', 'stream', 'begin', { game });
    } catch (error) {
      log.error(error);
    }
  });
};
