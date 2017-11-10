const { eventsTypes } = require('../events');

const projection = (eventsHistory) => {
  const reducer = (currentState, event) => {
    if (event.type === eventsTypes.gotAchievement) {
      return currentState.concat({ viewer: event.id, achievement: event.achievement });
    }
    if (event.type === eventsTypes.migratedData) {
      const oldAchievements = event.achievements.map(a => ({ viewer: event.id, achievement: a }));
      return currentState.concat(oldAchievements);
    }
    return currentState;
  };

  let state = eventsHistory.reduce(reducer, []);

  const apply = (event) => {
    state = reducer(state, event);
  };

  const getState = () => state;

  return { apply, getState };
};

module.exports = (bus) => {
  const p = projection([]);
  bus.subscribe('viewer', p.apply);

  const getAll = () => p.getState();

  const getLasts = () => p.getState().slice(-5).reverse();

  const getForViewer = viewer => p.getState()
    .filter(av => av.viewer === viewer)
    .map(av => av.achievement);

  return { getAll, getLasts, getForViewer };
};
