module.exports = (db) => {
  const get = (aggregate, id) =>
    db.collection('events')
      .find({ aggregate, id })
      .sort({ insert_date: 1 })
      .toArray();

  const getAll = aggregate =>
    db.collection('events')
      .find({ aggregate })
      .sort({ insert_date: 1 })
      .toArray();

  const storeEvent = (event) => {
    const eventEntry = {
      ...event,
      insert_date: new Date(),
    };
    return db.collection('events').insertOne(eventEntry);
  };

  return { storeEvent, get, getAll };
};
