module.exports = db =>
  Promise.all([
    db.query('truncate table events'),
    db.query('truncate table snapshots'),
  ]);
