const events = require('./events');
const achievements = require('./achievements');

module.exports = {
  chatMessage: (projection, { message, displayName }) =>
    events.sentChatMessage(message, displayName),

  giveAchievement: (projection, { achievement }) => {
    if (projection.achievementsReceived.includes(achievement)) {
      throw new Error('bad_request user already has achievement');
    }
    if (!achievements[achievement]) {
      throw new Error('bad_request achievement doesnt exist');
    }
    return events.gotAchievement(achievement);
  },

  subscribe: (projection, { message, method, displayName }) => {
    const subEvent = events.subscribed(method);
    if (message) {
      return [subEvent, events.sentChatMessage(message, displayName)];
    }
    return subEvent;
  },

  resub: (projection, {
    message, method, months, displayName,
  }) => {
    const resubEvent = events.resubscribed(method, months);
    if (message) {
      return [resubEvent, events.sentChatMessage(message, displayName)];
    }
    return resubEvent;
  },

  cheer: (projection, { message, amount, displayName }) => [
    events.cheered(amount),
    events.sentChatMessage(message, displayName),
  ],

  donate: (projection, { amount }) => events.donated(amount),

  join: (projection) => {
    if (projection.connected) {
      throw new Error('bad_request viewer already connected');
    }
    return events.joined();
  },

  leave: (projection) => {
    if (!projection.connected) {
      throw new Error('bad_request viewer not connected');
    }
    return events.left();
  },

  host: (projection, { nbViewers }) => events.hosted(nbViewers),

  follow: () => events.followed(),
};
