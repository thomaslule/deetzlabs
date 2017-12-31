const {
  eventsTypes,
  begun,
  changedGame,
  ended,
} = require('./events');
const projection = require('../util/projection');

const defaultState = { broadcasting: false, game: '' };

module.exports = (id, eventsHistory, initState = defaultState) => {
  const decProj = projection(
    eventsHistory,
    initState,
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
