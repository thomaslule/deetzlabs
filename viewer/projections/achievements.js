const { eventsTypes } = require('../events');

const projection = (eventsHistory) => {
  const reducer = (currentState, event) => {
    if (event.type === eventsTypes.gotAchievement) {
      return currentState.concat({
        viewer: event.id,
        achievement: event.achievement,
        date: event.insert_date,
      });
    }
    if (event.type === eventsTypes.migratedData) {
      const oldAchievements = event.achievements
        .map(a => ({ viewer: event.id, achievement: a.achievement, date: a.date }));
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

  const getAll = () =>
    p.getState()
      .map(a => (a.date ? a : { ...a, date: '2000-01-01' }))
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(({ date, ...rest }) => rest);

  const getLasts = () => getAll().slice(-5).reverse();

  const getForViewer = viewer => getAll()
    .filter(av => av.viewer === viewer)
    .map(av => av.achievement);

  return { getAll, getLasts, getForViewer };
};
