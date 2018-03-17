const QueryStream = require('pg-query-stream');
const { Transform } = require('stream');
const { inMemoryStorage } = require('event-closet');

const rowToEvent = () => new Transform({
  objectMode: true,
  transform(row, encoding, callback) {
    this.push(row.event);
    callback();
  },
});

module.exports = (db) => {
  const storeEvent = async (event) => {
    await db.query(
      'insert into events(insert_date, aggregate, id, sequence, event) values ($1, $2, $3, $4, $5)',
      [event.insertDate, event.aggregate, event.id, event.sequence, event],
    );
  };

  const queryToEventStream = (query, params) => {
    const transformer = rowToEvent();
    db.connect()
      .then((client) => {
        client.query(new QueryStream(query, params))
          .on('end', () => { client.release(); })
          .on('error', (err) => {
            client.release();
            transformer.emit('error', err);
          })
          .pipe(transformer);
      })
      .catch((err) => { transformer.emit('error', err); });
    return transformer;
  };

  const getEvents = (aggregate, id) =>
    queryToEventStream('select event from events where aggregate = $1 and id = $2 order by sequence', [aggregate, id]);

  const getAllEvents = () =>
    queryToEventStream('select event from events order by insert_date, sequence');

  const storeSnapshot = async (aggregate, id, projection, snapshot) => {
    await db.query(
      `
      insert into snapshots(aggregate, id, projection, snapshot) values ($1, $2, $3, $4)
      on conflict (aggregate, id, projection) do update set snapshot = $4
      `,
      [aggregate, id, projection, snapshot],
    );
  };

  const getSnapshot = async (aggregate, id, projection) => {
    const res = await db.query(
      'select snapshot from snapshots where aggregate = $1 and id = $2 and projection = $3',
      [aggregate, id, projection],
    );
    if (res.rowCount === 0) {
      return undefined;
    }
    return res.rows[0].snapshot;
  };

  const { storeProjection, getProjection } = inMemoryStorage();

  return {
    storeEvent, getEvents, getAllEvents, storeProjection, getProjection, storeSnapshot, getSnapshot,
  };
};
