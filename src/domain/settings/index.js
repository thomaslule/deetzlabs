const commands = require('./commands');
const settingsProjection = require('./projections/settings').default;

module.exports = (closet) => {
  closet.registerAggregate('settings', () => {});
  Object.keys(commands).forEach((command) => { closet.registerCommand('settings', command, commands[command]); });
  closet.registerProjection('settings', ['settings'], settingsProjection);
};
