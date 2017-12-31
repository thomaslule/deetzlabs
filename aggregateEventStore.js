const Queue = require('promise-queue');

module.exports = (eventStore, snapshotStore, aggregate, constructor, options = { maxEventsLength: 100 }) => {
  const queues = {};

  const add = async (id, calculateNewEvents) => {
    if (!queues[id]) {
      queues[id] = new Queue(1);
    }
    return queues[id].add(async () => {
      const snapshot = await snapshotStore.get(aggregate, id);
      const rows = await eventStore.get(aggregate, id, snapshot.lastEventId);
      const item = constructor(id, rows.map(r => r.event), snapshot.snapshot);
      if (rows.length > options.maxEventsLength) {
        // no need to await
        snapshotStore.store(aggregate, id, rows[rows.length - 1].event_id, item.getState());
      }
      const newEvents = calculateNewEvents(item);
      const chain = newEvents
        .map(newEvent => () => eventStore.insert(newEvent))
        .reduce((prev, cur) => prev.then(cur), Promise.resolve());
      await chain;
      return newEvents;
    });
  };

  return { add };
};
