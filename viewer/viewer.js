const clone = require('clone');
const pickBy = require('lodash/pickBy');
const achievements = require('../achievements');
const {
  eventsTypes,
  migratedData,
  sentChatMessage,
  gotAchievement,
  subscribed,
  cheered,
  joined,
  left,
  resubscribed,
  hosted,
} = require('./events');
const projection = require('../util/projection');

module.exports = (id, eventsHistory) => {
  const decProj = projection(
    eventsHistory,
    { achievementsReceived: [], achievements: {} },
    (state, event) => {
      const newState = clone(state);
      Object.keys(achievements).forEach((achievement) => {
        newState.achievements[achievement] = achievements[achievement]
          .reducer(newState.achievements[achievement], event);
      });
      if (event.type === eventsTypes.gotAchievement) {
        return {
          ...newState,
          achievementsReceived: newState.achievementsReceived.concat(event.achievement),
        };
      }
      if (event.type === eventsTypes.joined) {
        return { ...newState, connected: true };
      }
      if (event.type === eventsTypes.left) {
        return { ...newState, connected: false };
      }
      if (event.type === eventsTypes.migratedData) {
        return {
          ...newState,
          achievementsReceived: newState.achievementsReceived
            .concat(event.achievements.map(a => a.achievement)),
        };
      }
      return newState;
    },
  );

  const dispatchAndApply = async (bus, event) => {
    await bus.dispatch(event);
    decProj.apply(event);
  };

  const maybeSendAchievement = (bus, achievement) =>
    (decProj.getState().achievementsReceived.includes(achievement)
      ? Promise.resolve()
      : dispatchAndApply(bus, gotAchievement(id, null, achievement)));

  const distributeAchievements = bus =>
    Promise.all(Object.keys(pickBy(decProj.getState().achievements, a => a.deserved))
      .map(a => maybeSendAchievement(bus, a)));

  const migrateData = (bus, data) => dispatchAndApply(bus, migratedData(id, data));

  const chatMessage = async (bus, displayName, message) => {
    await dispatchAndApply(bus, sentChatMessage(id, displayName, message));
    return distributeAchievements(bus);
  };

  const receiveAchievement = (bus, achievement, displayName) => {
    if (decProj.getState().achievementsReceived.includes(achievement)) {
      return Promise.reject(new Error('bad_request user already has achievement'));
    }
    if (!achievements[achievement]) {
      return Promise.reject(new Error('bad_request achievement doesnt exist'));
    }
    return dispatchAndApply(bus, gotAchievement(id, displayName, achievement));
  };

  const subscribe = async (bus, displayName, message, method) => {
    await dispatchAndApply(bus, subscribed(id, displayName, message, method));
    return distributeAchievements(bus);
  };

  const resub = async (bus, displayName, message, method, months) => {
    await dispatchAndApply(bus, resubscribed(id, displayName, message, method, months));
    return distributeAchievements(bus);
  };

  const cheer = async (bus, displayName, message, amount) => {
    await chatMessage(bus, displayName, message);
    await dispatchAndApply(bus, cheered(id, displayName, amount));
    return distributeAchievements(bus);
  };

  const join = async (bus, displayName) => {
    if (decProj.getState().connected) {
      throw new Error('bad_request viewer already connected');
    }
    await dispatchAndApply(bus, joined(id, displayName));
    return distributeAchievements(bus);
  };

  const leave = async (bus, displayName) => {
    if (!decProj.getState().connected) {
      throw new Error('bad_request viewer not connected');
    }
    await dispatchAndApply(bus, left(id, displayName));
    return distributeAchievements(bus);
  };

  const host = async (bus, nbViewers) => {
    await dispatchAndApply(bus, hosted(id, nbViewers));
    await distributeAchievements(bus);
  };

  return {
    migrateData,
    chatMessage,
    receiveAchievement,
    subscribe,
    resub,
    cheer,
    join,
    leave,
    host,
  };
};
