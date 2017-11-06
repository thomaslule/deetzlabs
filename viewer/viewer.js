const isCommand = require('../util/isCommand');
const achievementDefinitions = require('../achievementDefinitions');
const {
  eventsTypes, changedDisplayName, sentChatMessage, gotAchievement,
} = require('./events');

const counters = {
  Ambianceuse: {
    magicNumber: 300,
    condition: () => true,
  },
  'Suédois LV1': {
    magicNumber: 1,
    condition: message => isCommand('hej', message.toLowerCase()),
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

  const chatMessage = (bus, displayName, message) => {
    const maybeChangeName = decProj.getState().displayName !== displayName
      ? dispatchAndApply(bus, changedDisplayName(id, displayName))
      : Promise.resolve();
    return maybeChangeName.then(() =>
      dispatchAndApply(bus, sentChatMessage(id, message))
        .then(() => {
          const promises = [];
          Object.keys(counters).forEach((achievement) => {
            if (decProj.getState().counters[achievement] === counters[achievement].magicNumber) {
              promises.push(dispatchAndApply(bus, gotAchievement(id, achievement)));
            }
          });
          return Promise.all(promises);
        }));
  };

  const receiveAchievement = (bus, achievement) => {
    if (decProj.getState().achievements.includes(achievement)) {
      return Promise.reject(new Error('user already has achievement'));
    }
    if (!achievementDefinitions[achievement]) {
      return Promise.reject(new Error('achievement doesnt exist'));
    }
    return dispatchAndApply(bus, gotAchievement(id, achievement));
  };

  return {
    chatMessage,
    receiveAchievement,
  };
};
