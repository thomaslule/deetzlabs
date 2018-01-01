const Queue = require('promise-queue');

module.exports = (eventStore, snapshotStore, aggregate, Projection) => {
  const queues = {};

  const add = async (id, calculateNewEvents) => {
    if (!queues[id]) {
      queues[id] = new Queue(1);
    }
    return queues[id].add(async () => {
      const snapshot = await snapshotStore.get(aggregate, id);
      const rows = await eventStore.get(aggregate, id, snapshot.lastEventId);
      const proj = Projection(rows.map(r => r.event), snapshot.snapshot);
      const newEvents = calculateNewEvents(proj);
      const chain = newEvents
        .map(newEvent => () => eventStore.insert(newEvent))
        .reduce((prev, cur) => prev.then(cur), Promise.resolve());
      await chain;
      return newEvents;
    });
  };

  return { add };
};
