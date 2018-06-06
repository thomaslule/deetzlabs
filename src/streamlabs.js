const io = require('socket.io-client');
const { log } = require('./logger');
const { normalizeHandle } = require('./util');

module.exports = (closet, opts) => {
  let socket;

  const start = () => {
    if (opts.streamlabs_socket_token) {
      socket = io(`https://sockets.streamlabs.com?token=${opts.streamlabs_socket_token}`);
      socket.on('event', async (data) => {
        try {
          if (data.type === 'donation' && !data.message[0].isTest) {
            const { from, amount } = data.message[0];
            log.info(`received a streamlabs donation: ${amount} from ${from}`);
            const viewer = normalizeHandle(from);
            await closet.handleCommand('viewer', viewer, 'donate', { amount });
          }
        } catch (err) {
          log.error(err);
        }
      });
      log.info('listening to streamlabs donations');
    }
  };

  const stop = () => {
    if (socket) {
      socket.close();
    }
  };

  return { start, stop };
};
