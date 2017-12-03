const eventsTypes = {
  begun: 'begun',
  changedGame: 'changedGame',
  ended: 'ended',
};

const createEvent = (type, content) => ({
  aggregate: 'stream',
  id: 'stream',
  version: 1,
  insert_date: (new Date()).toISOString(),
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
