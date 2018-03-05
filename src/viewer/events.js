const eventsTypes = {
  migratedData: 'migrated-data',
  sentChatMessage: 'sent-chat-message',
  gotAchievement: 'got-achievement',
  subscribed: 'subscribed',
  resubscribed: 'resubscribed',
  cheered: 'cheered',
  joined: 'joined',
  left: 'left',
  hosted: 'hosted',
  followed: 'followed',
};

const createEvent = (type, content) => ({
  version: 1,
  type,
  ...content,
});

const gotAchievement = achievement =>
  createEvent(eventsTypes.gotAchievement, {
    achievement,
  });

const hosted = nbViewers =>
  createEvent(eventsTypes.hosted, { nbViewers });

module.exports = {
  eventsTypes,
  gotAchievement,
  hosted,
};
