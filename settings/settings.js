const {
  achievementVolumeChanged,
} = require('./events');

const decisionProjection = (eventsHistory) => {
  const reducer = currentState => currentState;

  let state = eventsHistory.reduce(reducer, {});

  const apply = (event) => {
    state = reducer(state, event);
  };

  const getState = () => state;

  return { apply, getState };
};

module.exports = (eventsHistory) => {
  const decProj = decisionProjection(eventsHistory);

  const dispatchAndApply = (bus, event) =>
    bus.dispatch(event)
      .then(() => {
        decProj.apply(event);
      });

  const changeAchievementVolume = (bus, volume) =>
    dispatchAndApply(bus, achievementVolumeChanged(volume));

  return {
    changeAchievementVolume,
  };
};
