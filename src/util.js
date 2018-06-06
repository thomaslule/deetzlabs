const normalizeHandle = str => str
  .normalize('NFD') // split accented characters : è => e`
  .toLowerCase()
  .replace(/ /g, '_')
  .replace(/[^a-z0-9_]/g, '');

module.exports = { normalizeHandle };
