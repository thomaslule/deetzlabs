const QueryStream = require('pg-query-stream');
const { Transform } = require('stream');

const rowToEvent = () => new Transform({
  objectMode: true,
  transform(row, encoding, callback) {
    this.push(row.event);
    callback();
  },
});

export default (options = {}) => {
  const opts = {
    eventsCollection: 'events',
    projectionsCollection: 'projections',
    url: '',
    connectOptions: {},
    db: null,
    ...options,
  };
  const { db } = opts;

  const end = async () => {
    await db.end();
  };

  const storeEvent = async (event) => {
    await db.query(
      'insert into events(insert_date, aggregate, object_id, sequence, event) values ($1, $2, $3, $4)',
      [event.insertDate, event.aggregate, event.id, event.sequence, event],
    );
  };

  const getEvents = (aggregate, id) => {
    const transStream = rowToEvent();
    db.connect().then((client) => {
      const stream = client.query(new QueryStream('select event from events where aggregate = $1 and object_id = $2 order by sequence', [aggregate, id]));
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

  const storeProjection = async (name, state) => {
    await db.collection(projectionsCollection)
      .replaceOne({ name }, { name, state }, { upsert: true });
  };

  const getProjection = async (name) => {
    const res = await db.collection(projectionsCollection).findOne({ name });
    return (res ? res.state : null);
  };

  return {
    end, storeEvent, getEvents, getAllEvents, storeProjection, getProjection,
  };
};
