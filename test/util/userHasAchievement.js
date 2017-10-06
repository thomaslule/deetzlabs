module.exports = (storage, achievement) =>
  (storage.getItemSync('achievements') || [])
    .filter(a => a.username === 'someone' && a.achievement === achievement)
    .length > 0;
