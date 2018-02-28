const pickBy = require('lodash/pickBy');
const achievements = require('../achievements');
const {
  migratedData,
  sentChatMessage,
  gotAchievement,
  subscribed,
  cheered,
  donated,
  joined,
  left,
  resubscribed,
  hosted,
  followed,
} = require('./events');

module.exports = (id, decProj) => {
  const applyAndReturn = (event) => {
    decProj.apply(event);
    return event;
  };

  const newAchievements = () => {
    const list = Object.keys(pickBy(decProj.getState().achievements, a => a.deserved))
      .filter(a => !decProj.getState().achievementsReceived.includes(a))
      .map(a => gotAchievement(id, null, a));
    list.forEach(applyAndReturn);
    return list;
  };

  const migrateData = data => applyAndReturn(migratedData(id, data));

  const chatMessage = (displayName, message) => [
    applyAndReturn(sentChatMessage(id, displayName, message)),
    ...newAchievements(),
  ];

  const receiveAchievement = (achievement, displayName) => {
    if (decProj.getState().achievementsReceived.includes(achievement)) {
      throw new Error('bad_request user already has achievement');
    }
    if (!achievements[achievement]) {
      throw new Error('bad_request achievement doesnt exist');
    }
    return applyAndReturn(gotAchievement(id, displayName, achievement));
  };

  const subscribe = (displayName, message, method) => [
    applyAndReturn(subscribed(id, displayName, message, method)),
    ...newAchievements(),
  ];

  const resub = (displayName, message, method, months) => [
    applyAndReturn(resubscribed(id, displayName, message, method, months)),
    ...newAchievements(),
  ];

  const cheer = (displayName, message, amount) => [
    applyAndReturn(sentChatMessage(id, displayName, message)),
    applyAndReturn(cheered(id, displayName, amount)),
    ...newAchievements(),
  ];

  const donate = amount => [
    applyAndReturn(donated(id, amount)),
    ...newAchievements(),
  ];

  const join = (displayName) => {
    if (decProj.getState().connected) {
      throw new Error('bad_request viewer already connected');
    }
    return [
      applyAndReturn(joined(id, displayName)),
      ...newAchievements(),
    ];
  };

  const leave = (displayName) => {
    if (!decProj.getState().connected) {
      throw new Error('bad_request viewer not connected');
    }
    return [
      applyAndReturn(left(id, displayName)),
      ...newAchievements(),
    ];
  };

  const host = nbViewers => [
    applyAndReturn(hosted(id, nbViewers)),
    ...newAchievements(),
  ];

  const follow = () => [
    applyAndReturn(followed(id)),
    ...newAchievements(),
  ];

  return {
    migrateData,
    chatMessage,
    receiveAchievement,
    subscribe,
    resub,
    cheer,
    donate,
    join,
    leave,
    host,
    follow,
  };
};
