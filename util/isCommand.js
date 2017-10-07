const isCommand = (command, message) => message === command || message.startsWith(`${command} `);

module.exports = isCommand;
