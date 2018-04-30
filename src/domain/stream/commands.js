const {
  begun,
  changedGame,
  ended,
} = require('./events');

module.exports = {
  begin: (projection, { game }) => {
    if (projection.broadcasting) {
      return [];
    }
    return begun(game);
  },

  changeGame: (projection, { game }) => {
    if (projection.game === game) {
      return [];
    }
    return changedGame(game);
  },

  end: (projection) => {
    if (!projection.broadcasting) {
      return [];
    }
    return ended();
  },
};
