const isCommand = (command, message) =>
  message.trim().toLowerCase() === command ||
  message.trim().toLowerCase().startsWith(`${command} `);

module.exports = { isCommand };
