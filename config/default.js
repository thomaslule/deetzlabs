module.exports = {
  port: 3100,
  base_path: '',
  db_url: 'postgresql://postgres:admin@localhost:5432/deetzlabs',
  log_to_console: false,
  log_to_file: true,
  channel: 'some_twitch_channel',
  client_id: '', // get it by registering a twitch app https://www.twitch.tv/kraken/oauth2/clients/new
  client_secret: '',
  streamer_token: '', // create your token here https://twitchapps.com/tmi/
  bot_name: '', // twitch account login
  bot_token: '', // create your token here https://twitchapps.com/tmi/
  webhook_url: '', // the reverse proxy must have an url which redirects to the path /twitch-webhook of this server
  secret: '', // any random string
  logins: {
    // key-value username => password
    // password hashed with crypto.createHash('sha256').update('p4ssw0rd').digest('base64')
  },
};
