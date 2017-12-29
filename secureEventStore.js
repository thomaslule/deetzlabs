const Queue = require('promise-queue');

module.exports = (store) => {
  const queues = {};

  const add = async (aggregate, id, calculateNewEvents) => {
    if (!queues[id]) {
      queues[id] = new Queue(1);
    }
    return queues[id].add(async () => {
      const events = await store.get(aggregate, id);
      const newEvents = calculateNewEvents(events);
      const chain = newEvents
        .map(newEvent => () => store.insert(newEvent))
        .reduce((prev, cur) => prev.then(cur), Promise.resolve());
      await chain;
      return newEvents;
    });
  };

  return {
    getEverything: store.getEverything, add,
  };
};
