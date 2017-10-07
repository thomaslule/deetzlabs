module.exports = (command, message) => message === command || message.startsWith(`${command} `);
