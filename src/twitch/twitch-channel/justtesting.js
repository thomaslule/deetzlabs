const config = require('config');
const Channel = require('.');

const channel = Channel({
  channel: 'juste_un_petit_test',
  username: config.get('bot_name'),
  token: config.get('bot_token'),
  clientId: config.get('client_id'),
  clientSecret: config.get('client_secret'),
});

channel.on('chat', () => console.log('chat'));
channel.on('stream-begin', () => console.log('stream begin'));
channel.on('stream-end', () => console.log('stream end'));
channel.connect();
