const TwitchHelix = require('twitch-helix');

module.exports = (bus, options) => {
  let previousGame = null;
  const helix = new TwitchHelix({
    clientId: options.clientId,
    clientSecret: options.clientSecret,
  });

  // get current broadcasted game or null if not broadcasting
  const getCurrentGame = async () => {
    const stream = await helix.getStreamInfoByUsername(options.channel);
    if (stream) {
      const game = await helix.sendHelixRequest(`games?id=${stream.game_id}`);
      return game[0].name;
    }
    return null;
  };

  const poll = async () => {
    try {
      const currentGame = await getCurrentGame();
      if (previousGame === null && currentGame !== null) {
        bus.emit('stream-begin', currentGame);
      } else if (previousGame !== null && currentGame === null) {
        bus.emit('stream-end');
      } else if (previousGame !== currentGame) {
        bus.emit('stream-change-game', currentGame);
      }
      previousGame = currentGame;
    } catch (err) {
      options.logger.error(err);
    }
  };

  return { poll };
};
