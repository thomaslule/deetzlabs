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

  twitch.on('cheer', async (channel, userstate, message) => {
    try {
      await closet.handleCommand('viewer', userstate.username, 'cheer', {
        message,
        amount: userstate.bits,
        displayName: userstate['display-name'],
      });
    } catch (error) {
      log.error(error);
    }
  });

  twitch.on('subscription', async (channel, username, method, message) => {
    try {
      await closet.handleCommand('viewer', username.toLowerCase(), 'subscribe', {
        message,
        method,
        displayName: username,
      });
    } catch (error) {
      log.error(error);
    }
  });

  twitch.on('resub', async (channel, username, months, message, userstate, methods) => {
    try {
      log.info('resub methods', methods);
      await closet.handleCommand('viewer', username.toLowerCase(), 'resub', {
        message,
        method: methods,
        months,
        displayName: username,
      });
    } catch (error) {
      log.error(error);
    }
  });

  twitch.on('join', async (channel, username, isSelf) => {
    try {
      if (isSelf) return;
      await closet.handleCommand('viewer', username.toLowerCase(), 'join');
    } catch (error) {
      log.error(error);
    }
  });

  twitch.on('leave', async (channel, username, isSelf) => {
    try {
      if (isSelf) return;
      await closet.handleCommand('viewer', username.toLowerCase(), 'leave');
    } catch (error) {
      log.error(error);
    }
  });

  twitch.on('hosted', async (channel, username, nbViewers, autohost) => {
    try {
      if (autohost) return;
      await closet.handleCommand('viewer', username.toLowerCase(), 'host', { nbViewers });
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

  twitch.on('stream-change-game', async (game) => {
    try {
      await closet.handleCommand('stream', 'stream', 'changeGame', { game });
    } catch (error) {
      log.error(error);
    }
  });

  twitch.on('stream-end', async () => {
    try {
      await closet.handleCommand('stream', 'stream', 'end');
    } catch (error) {
      log.error(error);
    }
  });

  twitch.on('top-clipper-change', async (viewer) => {
    try {
      const oldTopClipper = await closet.getProjection('topClipper');
      if (oldTopClipper !== viewer) {
        if (oldTopClipper) await closet.handleCommand('viewer', oldTopClipper, 'loseTopClipper');
        await closet.handleCommand('viewer', viewer, 'becomeTopClipper');
      }
    } catch (error) {
      log.error(error);
    }
  });
};
