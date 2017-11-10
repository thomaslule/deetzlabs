const clone = require('clone');
const pickBy = require('lodash/pickBy');
const achievements = require('../achievements');
const {
  eventsTypes,
  changedDisplayName,
  sentChatMessage,
  gotAchievement,
  subscribed,
  cheered,
} = require('./events');

const decisionProjection = (eventsHistory, id) => {
  const reducer = (currentState, event) => {
    const newState = clone(currentState);
    Object.keys(achievements).forEach((achievement) => {
      newState.achievements[achievement] = achievements[achievement]
        .reducer(newState.achievements[achievement], event);
    });
    if (event.type === eventsTypes.changedDisplayName) {
      return { ...newState, displayName: event.displayName };
    }
    if (event.type === eventsTypes.gotAchievement) {
      return {
        ...newState,
        achievementsReceived: newState.achievementsReceived.concat(event.achievement),
      };
    }
    return newState;
  };

  let state = eventsHistory.reduce(
    reducer,
    {
      displayName: id, achievementsReceived: [], achievements: {},
    },
  );

  const apply = (event) => {
    state = reducer(state, event);
  };

  const getState = () => state;

  return { apply, getState };
};

module.exports = (id, eventsHistory) => {
  const decProj = decisionProjection(eventsHistory, id);

  const dispatchAndApply = (bus, event) =>
    bus.dispatch(event)
      .then(() => {
        decProj.apply(event);
      });

  const maybeChangeName = (bus, displayName) => (
    (displayName && decProj.getState().displayName !== displayName)
      ? dispatchAndApply(bus, changedDisplayName(id, displayName))
      : Promise.resolve()
  );

  const maybeSendAchievement = (bus, achievement) =>
    (decProj.getState().achievementsReceived.includes(achievement)
      ? Promise.resolve()
      : dispatchAndApply(bus, gotAchievement(id, achievement)));

  const distributeAchievements = bus =>
    Promise.all(Object.keys(pickBy(decProj.getState().achievements, a => a.deserved))
      .map(a => maybeSendAchievement(bus, a)));

  const chatMessage = (bus, displayName, message) =>
    maybeChangeName(bus, displayName)
      .then(() => dispatchAndApply(bus, sentChatMessage(id, message)))
      .then(() => distributeAchievements(bus));

  const receiveAchievement = (bus, achievement, displayName) =>
    maybeChangeName(bus, displayName)
      .then(() => {
        if (decProj.getState().achievementsReceived.includes(achievement)) {
          return Promise.reject(new Error('bad_request user already has achievement'));
        }
        if (!achievements[achievement]) {
          return Promise.reject(new Error('bad_request achievement doesnt exist'));
        }
        return dispatchAndApply(bus, gotAchievement(id, achievement));
      });

  const subscribe = (bus, method, message, displayName) =>
    maybeChangeName(bus, displayName)
      .then(() => dispatchAndApply(bus, subscribed(id, method, message)))
      .then(() => distributeAchievements(bus));

  const cheer = (bus, displayName, message, amount) =>
    chatMessage(bus, displayName, message)
      .then(() => dispatchAndApply(bus, cheered(id, amount)))
      .then(() => distributeAchievements(bus));

  return {
    chatMessage,
    receiveAchievement,
    subscribe,
    cheer,
  };
};
