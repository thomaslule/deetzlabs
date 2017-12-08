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
};

const createEvent = (type, id, content) => ({
  aggregate: 'viewer',
  version: 1,
  insert_date: (new Date()).toISOString(),
  type,
  id,
  ...content,
});

const migratedData = (id, data) => createEvent(eventsTypes.migratedData, id, data);

const sentChatMessage = (id, displayName, message) =>
  createEvent(eventsTypes.sentChatMessage, id, {
    displayName,
    message,
  });

const gotAchievement = (id, displayName, achievement) =>
  createEvent(eventsTypes.gotAchievement, id, {
    displayName,
    achievement,
  });

const subscribed = (id, displayName, message, method) =>
  createEvent(eventsTypes.subscribed, id, {
    displayName,
    message,
    method,
  });

const resubscribed = (id, displayName, message, method, months) =>
  createEvent(eventsTypes.resubscribed, id, {
    displayName,
    message,
    method,
    months,
  });

const cheered = (id, displayName, amount) =>
  createEvent(eventsTypes.cheered, id, {
    displayName,
    amount,
  });

const joined = (id, displayName) =>
  createEvent(eventsTypes.joined, id, {
    displayName,
  });

const left = (id, displayName) =>
  createEvent(eventsTypes.left, id, {
    displayName,
  });

const hosted = (id, nbViewers) =>
  createEvent(eventsTypes.hosted, id, { nbViewers });

module.exports = {
  eventsTypes,
  migratedData,
  sentChatMessage,
  gotAchievement,
  subscribed,
  resubscribed,
  cheered,
  joined,
  left,
  hosted,
};
