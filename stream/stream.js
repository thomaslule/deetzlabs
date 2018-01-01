const {
  begun,
  changedGame,
  ended,
} = require('./events');

module.exports = (id, decProj) => {
  const applyAndReturn = (event) => {
    decProj.apply(event);
    return [event];
  };

  const begin = (game) => {
    if (decProj.getState().broadcasting) {
      throw new Error('bad_request already broadcasting');
    }
    return applyAndReturn(begun(game));
  };


  const changeGame = (game) => {
    if (decProj.getState().game === game) {
      throw new Error('bad_request game is the same');
    }
    return applyAndReturn(changedGame(game));
  };

  const end = () => {
    if (!decProj.getState().broadcasting) {
      throw new Error('bad_request not broadcasting');
    }
    return applyAndReturn(ended());
  };

  return {
    begin,
    end,
    changeGame,
  };
};
