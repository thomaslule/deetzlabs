const decProj = require('./decisionProjection');
const commands = require('./commands');
const routes = require('./routes');

module.exports = (closet) => {
  closet.registerAggregate('stream', decProj);
  Object.keys(commands).forEach((command) => { closet.registerCommand('stream', command, commands[command]); });

  return {
    routes: routes(closet),
  };
};
