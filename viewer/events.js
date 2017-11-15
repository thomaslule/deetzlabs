const eventsTypes = {
  migratedData: 'migrated-data',
  sentChatMessage: 'sent-chat-message',
  gotAchievement: 'got-achievement',
  subscribed: 'subscribed',
  cheered: 'cheered',
  joined: 'joined',
  left: 'left',
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

const subscribed = (id, displayName, method) =>
  createEvent(eventsTypes.subscribed, id, {
    displayName,
    method,
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

module.exports = {
  eventsTypes,
  migratedData,
  sentChatMessage,
  gotAchievement,
  subscribed,
  cheered,
  joined,
  left,
};
