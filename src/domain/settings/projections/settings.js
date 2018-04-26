const { eventsTypes } = require('../events');

const initHtml = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans">
<div class="container">
  <div class="total_bar">
    <span id="current_amount"></span>
    <div class="title">Goal to 100!</div>
    <div id="goal"></div>
  </div>
  <div class="shadow_bar"></div>
  <div id="current_bar"></div>
</div>
`;

const initCss = `
.container {
  width: 100%;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 3px #222;
  height: 56px;
  background: rgb(221, 221, 221);
}

.total_bar {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 11;
  text-align: center;
  vertical-align: middle;
  color: rgb(0, 0, 0);
  font-style: normal;
  font-variant: normal;
  font-weight: 800;
  font-stretch: normal;
  font-size: 22px;
  line-height: 56px;
  font-family: Open Sans;
}

.title {
  left: 10px;
}

#goal,
.title,
#current_amount {
  position: absolute;
  top: 0;
  text-shadow: 0 0 1px #222;
}

#goal {
  right: 10px;
}

#current_bar {
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9;
  box-shadow: 0 0 1px #000;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.15)) rgb(70, 230, 90);
}

.shadow_bar {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 10;
  box-shadow: rgb(0, 0, 0) 0px 0px 2px inset;
}
`;

const initState = {
  achievementVolume: 0.5,
  followersGoal: { goal: 10, html: initHtml, css: initCss },
};
const proj = (state = initState, event) => {
  if (event.type === eventsTypes.achievementVolumeChanged) {
    return { ...state, achievementVolume: event.volume };
  }
  if (event.type === eventsTypes.followersGoalChanged) {
    return { ...state, followersGoal: event.settings };
  }
  return state;
};

const getAchievementVolume = state => state.achievementVolume;

const getFollowersGoal = state => state.followersGoal;

module.exports = {
  default: proj,
  getAchievementVolume,
  getFollowersGoal,
};
