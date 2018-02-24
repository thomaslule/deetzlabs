const { log } = require('../logger');

module.exports = (
  eventStore,
  snapshotStore,
  aggregate,
  Projection,
  nbOfEventsBeforeSnapshot = 100,
) => {
  const nbEventsById = {};

  const refresh = async (id) => {
    const rows = await eventStore.get(aggregate, id);
    if (rows.length > 0) {
      const proj = Projection(rows.map(r => r.event));
      await snapshotStore.store(aggregate, id, rows[rows.length - 1].event_id, proj.getState());
    }
  };

  const refreshAll = async () => {
    await Promise.all(Object.keys(nbEventsById)
      .filter(id => nbEventsById[id] >= nbOfEventsBeforeSnapshot)
      .map(id => refresh(id)));
    log.info('refreshed all snapshots');
  };

  const onEvent = async (event, isReplay) => {
    if (!nbEventsById[event.id]) {
      nbEventsById[event.id] = 0;
    }
    nbEventsById[event.id] += 1;
    if (!isReplay && nbEventsById[event.id] % nbOfEventsBeforeSnapshot === 0) {
      await refresh(event.id);
    }
  };

  return { refresh, refreshAll, onEvent };
};
