const config = require('config');
const twitch = require('./twitchApi');

module.exports = (bus) => {
  bus.on('webhook-follow', async (followerId) => {
    const follower = await twitch.getUserName(followerId);
    bus.emit('follow', follower);
  });

  const refresh = async () => {
    const streamerId = await twitch.getUserId(config.channel);
    // await twitch.registerFollowHook(streamerId);
  };

  return { refresh };
};
