module.exports = (db) => {
  const get = async (aggregate, id) => {
    const res = await db.query('select snapshot, last_event_id from snapshots where aggregate = $1 and object_id = $2', [aggregate, id]);
    if (res.rowCount === 0) {
      return { lastEventId: '0', snapshot: undefined };
    }
    return { lastEventId: res.rows[0].last_event_id, snapshot: res.rows[0].snapshot };
  };

  const store = async (aggregate, objectId, lastEventId, snapshot) =>
    db.query(
      `
      insert into snapshots(aggregate, object_id, last_event_id, snapshot) values ($1, $2, $3, $4)
      on conflict (aggregate, object_id) do update set last_event_id = $3, snapshot = $4
      `,
      [aggregate, objectId, lastEventId, snapshot],
    );

  const empty = () => db.query('truncate table snapshots');

  return { get, store, empty };
};
