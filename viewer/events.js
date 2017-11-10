const eventsTypes = {
  migratedData: 'migrated-data',
  sentChatMessage: 'sent-chat-message',
  gotAchievement: 'got-achievement',
  subscribed: 'subscribed',
  cheered: 'cheered',
};

const baseEvent = {
  aggregate: 'viewer',
  version: 1,
};

const migratedData = (id, data) => ({
  ...baseEvent,
  type: eventsTypes.migratedData,
  id,
  ...data,
});

const sentChatMessage = (id, displayName, message) => ({
  ...baseEvent,
  type: eventsTypes.sentChatMessage,
  id,
  displayName,
  message,
});

const gotAchievement = (id, displayName, achievement) => ({
  ...baseEvent,
  type: eventsTypes.gotAchievement,
  id,
  displayName,
  achievement,
});

const subscribed = (id, displayName, method) => ({
  ...baseEvent,
  type: eventsTypes.subscribed,
  id,
  displayName,
  method,
});

const cheered = (id, displayName, amount) => ({
  ...baseEvent,
  type: eventsTypes.cheered,
  id,
  displayName,
  amount,
});

module.exports = {
  eventsTypes,
  migratedData,
  sentChatMessage,
  gotAchievement,
  subscribed,
  cheered,
};
