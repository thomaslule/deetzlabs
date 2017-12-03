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

  const dispatchAndApply = async (bus, event) => {
    await bus.dispatch(event);
    decProj.apply(event);
  };

  const begin = async (bus, game) => {
    if (decProj.getState().broadcasting) {
      throw new Error('bad_request already broadcasting');
    }
    await dispatchAndApply(bus, begun(game));
  };

  const changeGame = async (bus, game) => {
    if (decProj.getState().game === game) {
      throw new Error('bad_request game is the same');
    }
    await dispatchAndApply(bus, changedGame(game));
  };

  const end = async (bus) => {
    if (!decProj.getState().broadcasting) {
      throw new Error('bad_request not broadcasting');
    }
    await dispatchAndApply(bus, ended());
  };

  return {
    begin,
    end,
    changeGame,
  };
};
