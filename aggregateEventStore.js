const Queue = require('promise-queue');

module.exports = (store, aggregate, constructor) => {
  const queues = {};

  const add = async (id, calculateNewEvents) => {
    if (!queues[id]) {
      queues[id] = new Queue(1);
    }
    return queues[id].add(async () => {
      const events = await store.get(aggregate, id);
      const item = constructor(id, events);
      const newEvents = calculateNewEvents(item);
      const chain = newEvents
        .map(newEvent => () => store.insert(newEvent))
        .reduce((prev, cur) => prev.then(cur), Promise.resolve());
      await chain;
      return newEvents;
    });
  };

  return { add };
};
