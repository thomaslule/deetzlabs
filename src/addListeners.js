const { log } = require('./logger');

module.exports = (twitch, closet) => {
  twitch.on('chat', async (channel, userstate, message, isSelf) => {
    try {
      if (isSelf) return;
      await closet.handleCommand('viewer', userstate.viewer, 'chatMessage', {
        message: userstate.message,
        displayName: userstate['display-name'],
      });
    } catch (error) {
      log.error(error);
    }
  });
};
