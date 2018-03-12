const proj = (state = {}, event) => {
  if (event.aggregate === 'viewer') {
    if (event.displayName) {
      return { ...state, [event.id]: event.displayName };
    }
    if (!state[event.id]) {
      return { ...state, [event.id]: event.id };
    }
  }
  return state;
};

const get = (state, id) => (state[id] ? state[id] : id);

const getAll = state => state;

module.exports = {
  default: proj,
  get,
  getAll,
};
