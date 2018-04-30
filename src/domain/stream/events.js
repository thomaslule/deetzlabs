const eventsTypes = {
  begun: 'begun',
  changedGame: 'changed-game',
  ended: 'ended',
};

const createEvent = (type, content) => ({
  version: 1,
  type,
  ...content,
});

const begun = game =>
  createEvent(eventsTypes.begun, { game });

const changedGame = game =>
  createEvent(eventsTypes.changedGame, { game });

const ended = () =>
  createEvent(eventsTypes.ended, {});

module.exports = {
  eventsTypes,
  begun,
  changedGame,
  ended,
};
