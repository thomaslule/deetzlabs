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

  const getAllForAllAggregates = () =>
    db.collection(collection)
      .find({})
      .sort({ insert_date: 1 })
      .toArray();

  const storeEvent = event => db.collection(collection).insertOne(event);

  return {
    storeEvent, get, getAll, getAllForAllAggregates,
  };
};
