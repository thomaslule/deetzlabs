const QueryStream = require('pg-query-stream');
const { Transform } = require('stream');

const rowToEvent = () => new Transform({
  objectMode: true,
  transform(row, encoding, callback) {
    this.push(row.event);
    callback();
  },
});

module.exports = (db, onEvent = () => null) => {
  const get = async (aggregate, id, fromEventId = '0') => {
    const res = await db.query('select event_id, event from events where aggregate = $1 and object_id = $2 and event_id > $3 order by event_id', [aggregate, id, fromEventId]);
    return res.rows;
  };

  const getEverything = async () => {
    const client = await db.connect();
    const stream = client.query(new QueryStream('select event from events order by event_id'));
    stream.on('end', () => { client.release(); });
    stream.on('error', () => { client.release(); });
    return stream.pipe(rowToEvent());
  };

  const insert = async (event) => {
    await db.query(
      'insert into events(insert_date, aggregate, object_id, event) values ($1, $2, $3, $4)',
      [event.insert_date, event.aggregate, event.id, event],
    );
    onEvent(event);
  };

  return {
    get, getEverything, insert,
  };
};