const {
  begun,
  changedGame,
  ended,
} = require('./events');

module.exports = {
  begin: (projection, { game }) => {
    if (projection.broadcasting) {
      throw new Error('bad_request already broadcasting');
    }
    return begun(game);
  },

  changeGame: (projection, { game }) => {
    if (projection.game === game) {
      throw new Error('bad_request game is the same');
    }
    return changedGame(game);
  },

  end: (projection) => {
    if (!projection.broadcasting) {
      throw new Error('bad_request not broadcasting');
    }
    return ended();
  },
};
