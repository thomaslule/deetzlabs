const { eventsTypes } = require('../events');

const proj = (state = [], event) => {
  if (event.aggregate === 'viewer') {
    if (event.type === eventsTypes.gotAchievement) {
      return state.concat({
        viewer: event.id,
        achievement: event.achievement,
        date: event.insert_date,
      });
    }
    if (event.type === eventsTypes.migratedData) {
      const oldAchievements = event.achievements
        .map(a => ({ viewer: event.id, achievement: a.achievement, date: a.date }));
      return state.concat(oldAchievements);
    }
  }
  return state;
};

const getAll = state =>
  state.map(a => (a.date ? a : { ...a, date: '2000-01-01' }))
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(({ date, ...rest }) => rest);

const getLasts = state => getAll(state).slice(-5).reverse();

const getForViewer = (state, viewer) => getAll(state)
  .filter(av => av.viewer === viewer)
  .map(av => av.achievement);

module.exports = {
  default: proj, getAll, getLasts, getForViewer,
};
