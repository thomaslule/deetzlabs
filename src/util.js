const normalizeHandle = str => str
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9_]/g, '_')
  .toLowerCase();

module.exports = { normalizeHandle };
