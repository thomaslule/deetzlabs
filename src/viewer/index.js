const decProj = require('./decisionProjection');
const commands = require('./commands');
const routes = require('./routes');

module.exports = (closet) => {
  closet.registerAggregate('viewer', decProj);
  Object.keys(commands).forEach((command) => { closet.registerCommand('viewer', command, commands[command]); });

  return {
    routes: routes(closet),
  };
};
