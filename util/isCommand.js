module.exports = (command, message) =>
  message.trim().toLowerCase() === command ||
  message.trim().toLowerCase().startsWith(`${command} `);
