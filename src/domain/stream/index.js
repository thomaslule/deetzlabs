const decProj = require('./decisionProjection');
const commands = require('./commands');

module.exports = (closet) => {
  closet.registerAggregate('stream', decProj);
  Object.keys(commands).forEach((command) => { closet.registerCommand('stream', command, commands[command]); });
};
