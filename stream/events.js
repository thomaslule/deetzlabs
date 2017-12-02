const eventsTypes = {
  begun: 'begun',
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

const begun = () =>
  createEvent(eventsTypes.begun, {});

const ended = () =>
  createEvent(eventsTypes.ended, {});

module.exports = {
  eventsTypes,
  begun,
  ended,
};
