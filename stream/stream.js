const {
  eventsTypes,
  begun,
  changedGame,
  ended,
} = require('./events');
const projection = require('../util/projection');

module.exports = (eventsHistory) => {
  const decProj = projection(
    eventsHistory,
    { broadcasting: false, game: '' },
    (state, event) => {
      if (event.type === eventsTypes.begun) {
        return { ...state, broadcasting: true, game: event.game };
      } else if (event.type === eventsTypes.changedGame) {
        return { ...state, game: event.game };
      } else if (event.type === eventsTypes.ended) {
        return { ...state, broadcasting: false };
      }
      return state;
    },
  );

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
/*
const getDecProj = eventsHistory =>
  projection(
    eventsHistory,
    { broadcasting: false, game: '' },
    (state, event) => {
      if (event.type === eventsTypes.begun) {
        return { ...state, broadcasting: true, game: event.game };
      } else if (event.type === eventsTypes.changedGame) {
        return { ...state, game: event.game };
      } else if (event.type === eventsTypes.ended) {
        return { ...state, broadcasting: false };
      }
      return state;
    },
  );

const begin = (eventsHistory, game) => {
  const decProj = getDecProj(eventsHistory);
  if (decProj.getState().broadcasting) {
    throw new Error('bad_request already broadcasting');
  }
  return [begun(game)];
};

const changeGame = (eventsHistory, game) => {
  const decProj = getDecProj(eventsHistory);
  if (decProj.getState().game === game) {
    throw new Error('bad_request game is the same');
  }
  return [changedGame(game)];
};

const end = (eventsHistory) => {
  const decProj = getDecProj(eventsHistory);
  if (!decProj.getState().broadcasting) {
    throw new Error('bad_request not broadcasting');
  }
  return [ended()];
};

module.exports = { begin, changeGame, end };
*/
