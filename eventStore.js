const QueryStream = require('pg-query-stream');
const { Transform } = require('stream');

const rowToEvent = () => new Transform({
  objectMode: true,
  transform(row, encoding, callback) {
    this.push(row.event);
    callback();
  },
});

module.exports = (db) => {
  const get = (aggregate, id) =>
    db.query('select event from events where aggregate = $1 and object_id = $2 order by insert_date', [aggregate, id])
      .then(res => res.rows.map(r => r.event));

  const getAll = aggregate =>
    db.query('select event from events where aggregate = $1 order by insert_date', [aggregate])
      .then(res => res.rows.map(r => r.event));

  const getAllForAllAggregates = () =>
    db.connect().then((client) => {
      const stream = client.query(new QueryStream('select event from events order by insert_date'));
      stream.on('end', () => { client.release(); });
      stream.on('error', () => { client.release(); });
      return stream.pipe(rowToEvent());
    });

  const storeEvent = event =>
    db.query(
      'insert into events(insert_date, aggregate, object_id, event) values ($1, $2, $3, $4)',
      [event.insert_date, event.aggregate, event.id, event],
    );

  return {
    storeEvent, get, getAll, getAllForAllAggregates,
  };
};
