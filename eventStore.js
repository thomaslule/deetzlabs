const collection = 'events';

module.exports = (db) => {
  const get = (aggregate, id) =>
    db.collection(collection)
      .find({ aggregate, id })
      .sort({ insert_date: 1 })
      .toArray();

  const getAll = aggregate =>
    db.collection(collection)
      .find({ aggregate })
      .sort({ insert_date: 1 })
      .toArray();

  const storeEvent = (event) => {
    const eventEntry = {
      ...event,
      insert_date: new Date(),
    };
    return db.collection(collection).insertOne(eventEntry);
  };

  return { storeEvent, get, getAll };
};
