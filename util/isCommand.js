module.exports = (command, message) => message.trim() === command || message.trim().startsWith(`${command} `);
