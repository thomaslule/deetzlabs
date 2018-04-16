const config = require('config');
const Channel = require('.');

const channel = Channel({
  channel: config.get('channel'),
  username: config.get('bot_name'),
  token: config.get('bot_token'),
  clientId: config.get('client_id'),
  clientSecret: config.get('client_secret'),
});

channel.on('chat', (...args) => { console.log('chat', args); });
channel.on('stream-begin', (...args) => { console.log('stream-begin', args); });
channel.on('stream-end', (...args) => { console.log('stream-end', args); });
channel.connect();
