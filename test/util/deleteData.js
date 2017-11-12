module.exports = db =>
  db.query('truncate table events')
    .then(() => db.query('truncate table log'));
