const twitchApi = require('./twitchApi');
const { log } = require('../logger');

module.exports = (bus) => {
  let previousGame = null;

  const poll = async () => {
    try {
      const currentGame = await twitchApi.currentGame();
      if (previousGame === null && currentGame !== null) {
        bus.emit('stream-begin', currentGame);
      } else if (previousGame !== null && currentGame === null) {
        bus.emit('stream-end');
      } else if (previousGame !== currentGame) {
        bus.emit('stream-change-game', currentGame);
      }
      previousGame = currentGame;
    } catch (err) {
      log.error(err);
    }
  };

  return { poll };
};
