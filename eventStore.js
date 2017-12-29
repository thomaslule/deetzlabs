const QueryStream = require('pg-query-stream');
const { Transform } = require('stream');
const Queue = require('promise-queue');

const rowToEvent = () => new Transform({
  objectMode: true,
  transform(row, encoding, callback) {
    this.push(row.event);
    callback();
  },
});

module.exports = (db) => {
  const queues = {};

  const add = async (aggregate, id, calculateNewEvents) => {
    if (!queues[id]) {
      queues[id] = new Queue(1);
    }
    return queues[id].add(async () => {
      const res = await db.query('select event from events where aggregate = $1 and object_id = $2 order by event_id', [aggregate, id]);
      const events = res.rows.map(r => r.event);
      const newEvents = calculateNewEvents(events);
      const chain = newEvents
        .map(newEvent => () => db.query(
          'insert into events(insert_date, aggregate, object_id, event) values ($1, $2, $3, $4)',
          [newEvent.insert_date, newEvent.aggregate, newEvent.id, newEvent],
        ))
        .reduce((prev, cur) => prev.then(cur), Promise.resolve());
      await chain;
      return newEvents;
    });
  };

  const get = async (aggregate, id) => {
    const res = await db.query('select event from events where aggregate = $1 and object_id = $2 order by event_id', [aggregate, id]);
    return res.rows.map(r => r.event);
  };

  const getEverything = async () => {
    const client = await db.connect();
    const stream = client.query(new QueryStream('select event from events order by event_id'));
    stream.on('end', () => { client.release(); });
    stream.on('error', () => { client.release(); });
    return stream.pipe(rowToEvent());
  };

  return {
    get, getEverything, add,
  };
};
