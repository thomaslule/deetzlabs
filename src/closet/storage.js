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

  const getEvents = (aggregate, id) => {
    const transStream = rowToEvent();
    db.connect().then((client) => {
      const stream = client.query(new QueryStream('select event from events where aggregate = $1 and id = $2 order by sequence', [aggregate, id]));
      stream.pipe(transStream);
      stream.on('end', () => { client.release(); });
      stream.on('error', () => { client.release(); });
    });
    return transStream;
  };

  const getAllEvents = () => {
    const transStream = rowToEvent();
    db.connect().then((client) => {
      const stream = client.query(new QueryStream('select event from events order by insert_date, sequence'));
      stream.pipe(transStream);
      stream.on('end', () => { client.release(); });
      stream.on('error', () => { client.release(); });
    });
    return transStream;
  };

  const { storeProjection, getProjection } = inMemoryStorage();

  return {
    storeEvent, getEvents, getAllEvents, storeProjection, getProjection,
  };
};
