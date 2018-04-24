const Channel = require('.');
const config = require('./config');

const channel = Channel({
  channel: config.channel,
  username: config.bot_name,
  token: config.bot_token,
  clientId: config.client_id,
  clientSecret: config.client_secret,
});

channel.on('chat', (...args) => { console.log('chat', args); });
channel.on('stream-begin', (...args) => { console.log('stream-begin', args); });
channel.on('stream-end', (...args) => { console.log('stream-end', args); });
channel.connect();
