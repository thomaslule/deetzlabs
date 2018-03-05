const eventsTypes = {
  migratedData: 'migrated-data',
  sentChatMessage: 'sent-chat-message',
  gotAchievement: 'got-achievement',
  subscribed: 'subscribed',
  resubscribed: 'resubscribed',
  cheered: 'cheered',
  donated: 'donated',
  joined: 'joined',
  left: 'left',
  hosted: 'hosted',
  followed: 'followed',
};

const createEvent = (type, content = {}) => ({
  version: 1,
  type,
  ...content,
});

module.exports = {
  eventsTypes,

  sentChatMessage: (message, displayName) =>
    createEvent(eventsTypes.sentChatMessage, {
      message,
      displayName,
    }),

  gotAchievement: achievement =>
    createEvent(eventsTypes.gotAchievement, {
      achievement,
    }),

  subscribed: method => createEvent(eventsTypes.subscribed, { method }),

  resubscribed: (method, months) =>
    createEvent(eventsTypes.resubscribed, {
      method,
      months,
    }),

  cheered: amount => createEvent(eventsTypes.cheered, { amount }),

  donated: amount => createEvent(eventsTypes.donated, { amount }),

  hosted: nbViewers => createEvent(eventsTypes.hosted, { nbViewers }),

  joined: () => createEvent(eventsTypes.joined),

  left: () => createEvent(eventsTypes.left),

  followed: () => createEvent(eventsTypes.followed),

  migratedData: data => createEvent(eventsTypes.migratedData, data),
};
