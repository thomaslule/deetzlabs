const events = require('./events');

module.exports = achievements => ({
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

  replayAchievement: (projection, { achievement }) => {
    if (!achievements[achievement]) {
      throw new Error('bad_request achievement doesnt exist');
    }
    return events.replayedAchievement(achievement);
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
      return [];
    }
    return events.joined();
  },

  leave: (projection) => {
    if (!projection.connected) {
      return [];
    }
    return events.left();
  },

  host: (projection, { nbViewers }) => events.hosted(nbViewers),

  follow: () => events.followed(),

  becomeTopClipper: () => events.becameTopClipper(),

  loseTopClipper: () => events.lostTopClipper(),
});
