module.exports = (db) => {
  const get = (aggregate, id) =>
    db.query('select event from events where aggregate = $1 and object_id = $2 order by insert_date', [aggregate, id])
      .then(res => res.rows.map(r => r.event));

  const getAll = aggregate =>
    db.query('select event from events where aggregate = $1 order by insert_date', [aggregate])
      .then(res => res.rows.map(r => r.event));

  const getAllForAllAggregates = () =>
    db.query('select event from events order by insert_date')
      .then(res => res.rows.map(r => r.event));

  const storeEvent = event =>
    db.query(
      'insert into events(insert_date, aggregate, object_id, event) values ($1, $2, $3, $4)',
      [event.insert_date, event.aggregate, event.id, event],
    );

  return {
    storeEvent, get, getAll, getAllForAllAggregates,
  };
};
