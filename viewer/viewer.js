const isCommand = require('../util/isCommand');
const achievementDefinitions = require('../achievementDefinitions');
const {
  eventsTypes,
  changedDisplayName,
  sentChatMessage,
  gotAchievement,
  subscribed,
  cheered,
} = require('./events');

const counters = {
  Ambianceuse: {
    magicNumber: 300,
    condition: () => true,
  },
  'Suédois LV1': {
    magicNumber: 1,
    condition: message => isCommand('hej', message),
  },
  Fossoyeuse: {
    magicNumber: 5,
    condition: message => isCommand('!rip', message),
  },
  'Pom-pom girl': {
    magicNumber: 5,
    condition: message => isCommand('!gg', message),
  },
  Berzingos: {
    magicNumber: 5,
    condition: message => isCommand('!berzingue', message),
  },
  Prudente: {
    magicNumber: 5,
    condition: message => isCommand('!heal', message) || isCommand('!save', message),
  },
  'Vigilance constante': {
    magicNumber: 5,
    condition: message => isCommand('!putain', message),
  },
};

const decisionProjection = (eventsHistory, id) => {
  const reducer = (currentState, event) => {
    if (event.type === eventsTypes.changedDisplayName) {
      return { ...currentState, displayName: event.displayName };
    }
    if (event.type === eventsTypes.sentChatMessage) {
      const newCounters = { ...currentState.counters };
      Object.keys(counters).forEach((achievement) => {
        if (counters[achievement].condition(event.message)) {
          newCounters[achievement] += 1;
        }
      });
      return { ...currentState, counters: newCounters };
    }
    if (event.type === eventsTypes.gotAchievement) {
      return { ...currentState, achievements: currentState.achievements.concat(event.achievement) };
    }
    return currentState;
  };

  const initialCounter = {};
  Object.keys(counters).forEach((achievement) => { initialCounter[achievement] = 0; });

  let state = eventsHistory.reduce(
    reducer,
    { displayName: id, counters: initialCounter, achievements: [] },
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

  const maybeChangeName = (bus, displayName) =>
    (decProj.getState().displayName !== displayName
      ? dispatchAndApply(bus, changedDisplayName(id, displayName))
      : Promise.resolve());

  const maybeSendAchievement = (bus, achievement) =>
    (decProj.getState().achievements.includes(achievement)
      ? Promise.resolve()
      : dispatchAndApply(bus, gotAchievement(id, achievement)));

  const chatMessage = (bus, displayName, message) =>
    maybeChangeName(bus, displayName)
      .then(() => dispatchAndApply(bus, sentChatMessage(id, message)))
      .then(() => {
        const promises = [];
        Object.keys(counters).forEach((achievement) => {
          if (decProj.getState().counters[achievement] >= counters[achievement].magicNumber) {
            promises.push(maybeSendAchievement(bus, achievement));
          }
        });
        return Promise.all(promises);
      });

  const receiveAchievement = (bus, achievement, displayName) =>
    maybeChangeName(bus, displayName)
      .then(() => {
        if (decProj.getState().achievements.includes(achievement)) {
          return Promise.reject(new Error('bad_request user already has achievement'));
        }
        if (!achievementDefinitions[achievement]) {
          return Promise.reject(new Error('bad_request achievement doesnt exist'));
        }
        return dispatchAndApply(bus, gotAchievement(id, achievement));
      });

  const subscribe = (bus, method, message, displayName) =>
    maybeChangeName(bus, displayName)
      .then(() => dispatchAndApply(bus, subscribed(id, method, message)))
      .then(() => maybeSendAchievement(bus, 'Mécène'));

  const cheer = (bus, displayName, message, amount) =>
    chatMessage(bus, displayName, message)
      .then(() => dispatchAndApply(bus, cheered(id, amount)))
      .then(() => maybeSendAchievement(bus, 'Mécène'));

  return {
    chatMessage,
    receiveAchievement,
    subscribe,
    cheer,
  };
};
