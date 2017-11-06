const eventsTypes = {
  changedDisplayName: 'changed-display-name',
  sentChatMessage: 'sent-chat-message',
  gotAchievement: 'got-achievement',
  subscribed: 'subscribed',
  cheered: 'cheered',
};

const baseEvent = {
  aggregate: 'viewer',
  version: 1,
};

const changedDisplayName = (id, displayName) => ({
  ...baseEvent,
  id,
  type: eventsTypes.changedDisplayName,
  displayName,
});

const sentChatMessage = (id, message) => ({
  ...baseEvent,
  type: eventsTypes.sentChatMessage,
  id,
  message,
});

const gotAchievement = (id, achievement) => ({
  ...baseEvent,
  type: eventsTypes.gotAchievement,
  id,
  achievement,
});

const subscribed = (id, method) => ({
  ...baseEvent,
  type: eventsTypes.subscribed,
  id,
  method,
});

const cheered = (id, amount) => ({
  ...baseEvent,
  type: eventsTypes.cheered,
  id,
  amount,
});

module.exports = {
  eventsTypes,
  changedDisplayName,
  sentChatMessage,
  gotAchievement,
  subscribed,
  cheered,
};
