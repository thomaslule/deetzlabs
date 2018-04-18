module.exports = {
  port: 3100,
  db_url: 'postgresql://postgres:admin@localhost:5432/deetzlabs',
  channel: 'some_twitch_channel',
  client_id: '', // get it by registering a twitch app https://dev.twitch.tv/dashboard/apps/create (Redirect URI is not used)
  client_secret: '', // secret of your registered twitch app
  streamer_token: '', // create your token here https://twitchapps.com/tmi/
  bot_name: '', // twitch bot login
  bot_token: '', // create your bot's token here https://twitchapps.com/tmi/
  secret: '', // any random string
  protect_api: true,
  logins: {
    // key-value username => password
    // password hashed with sha256 (you can use ./hashPassword.js to create your hash)
  },
  log_to_console: false,
  log_to_file: true,
};
