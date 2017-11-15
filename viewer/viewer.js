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
} = require('./events');

const decisionProjection = (eventsHistory) => {
  const reducer = (currentState, event) => {
    const newState = clone(currentState);
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
  };

  let state = eventsHistory.reduce(
    reducer,
    {
      achievementsReceived: [], achievements: {},
    },
  );

  const apply = (event) => {
    state = reducer(state, event);
  };

  const getState = () => state;

  return { apply, getState };
};

module.exports = (id, eventsHistory) => {
  const decProj = decisionProjection(eventsHistory);

  const dispatchAndApply = (bus, event) =>
    bus.dispatch(event)
      .then(() => {
        decProj.apply(event);
      });

  const maybeSendAchievement = (bus, achievement) =>
    (decProj.getState().achievementsReceived.includes(achievement)
      ? Promise.resolve()
      : dispatchAndApply(bus, gotAchievement(id, null, achievement)));

  const distributeAchievements = bus =>
    Promise.all(Object.keys(pickBy(decProj.getState().achievements, a => a.deserved))
      .map(a => maybeSendAchievement(bus, a)));

  const migrateData = (bus, data) => dispatchAndApply(bus, migratedData(id, data));

  const chatMessage = (bus, displayName, message) =>
    dispatchAndApply(bus, sentChatMessage(id, displayName, message))
      .then(() => distributeAchievements(bus));

  const receiveAchievement = (bus, achievement, displayName) => {
    if (decProj.getState().achievementsReceived.includes(achievement)) {
      return Promise.reject(new Error('bad_request user already has achievement'));
    }
    if (!achievements[achievement]) {
      return Promise.reject(new Error('bad_request achievement doesnt exist'));
    }
    return dispatchAndApply(bus, gotAchievement(id, displayName, achievement));
  };

  const subscribe = (bus, displayName, message, method) =>
    dispatchAndApply(bus, subscribed(id, displayName, message, method))
      .then(() => distributeAchievements(bus));

  const resub = (bus, displayName, message, method, months) =>
    dispatchAndApply(bus, resubscribed(id, displayName, message, method, months))
      .then(() => distributeAchievements(bus));

  const cheer = (bus, displayName, message, amount) =>
    chatMessage(bus, displayName, message)
      .then(() => dispatchAndApply(bus, cheered(id, displayName, amount)))
      .then(() => distributeAchievements(bus));

  const join = (bus, displayName) => {
    if (decProj.getState().connected) {
      return Promise.reject(new Error('bad_request viewer already connected'));
    }
    return dispatchAndApply(bus, joined(id, displayName))
      .then(() => distributeAchievements(bus));
  };

  const leave = (bus, displayName) => {
    if (!decProj.getState().connected) {
      return Promise.reject(new Error('bad_request viewer not connected'));
    }
    return dispatchAndApply(bus, left(id, displayName))
      .then(() => distributeAchievements(bus));
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
  };
};
