const config = require('config');
const request = require('request-promise-native');
const { log } = require('../logger');

const kraken = 'https://api.twitch.tv/kraken';
const helix = 'https://api.twitch.tv/helix';

const currentGame = async () => {
  const res = await request.get(
    `${kraken}/streams/${config.get('channel')}`,
    {
      json: true,
      headers: { 'Client-ID': config.get('client_id') },
    },
  );
  return res.stream ? res.stream.game : null;
};

const getUserId = async (name) => {
  const res = await request.get(
    `${helix}/users?login=${name}`,
    {
      json: true,
      headers: { 'Client-ID': config.get('client_id') },
    },
  );
  return res.data.length > 0 ? res.data[0].id : null;
};

const getUserName = async (id) => {
  const res = await request.get(
    `${helix}/users?id=${id}`,
    {
      json: true,
      headers: { 'Client-ID': config.get('client_id') },
    },
  );
  return res.data.length > 0 ? res.data[0].login : null;
};

const registerFollowHook = async (streamerId) => {
  try {
    await request.post(
      `${helix}/webhooks/hub`,
      {
        json: {
          'hub.callback': config.get('webhook_url'),
          'hub.mode': 'subscribe',
          'hub.topic': `${helix}/users/follows?first=1&to_id=${streamerId}`,
          'hub.secret': config.get('secret'),
          'hub.lease_seconds': 24 * 60 * 60 * 1000,
        },
        headers: { 'Client-ID': config.get('client_id') },
      },
    );
    log.info('registered follow hook');
  } catch (e) {
    log.error(e);
  }
};

module.exports = {
  currentGame, getUserId, getUserName, registerFollowHook,
};
