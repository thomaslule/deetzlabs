const createDiv = (className, content) => {
  const div = document.createElement('div');
  div.className = className;
  div.innerHTML = content;
  return div;
};

const addCategory = (wrapper, category, list) => {
  if (list.length > 0) {
    wrapper.appendChild(createDiv('job', category));
    list.forEach((item) => { wrapper.appendChild(createDiv('name', item)); });
  }
};

const addAchievements = (wrapper, achievements) => {
  const achToViewers = {};
  achievements.forEach((a) => {
    if (!achToViewers[a.achievement]) {
      achToViewers[a.achievement] = [];
    }
    achToViewers[a.achievement].push(a.viewer);
  });
  Object.keys(achToViewers).forEach((a) => {
    addCategory(wrapper, a, achToViewers[a]);
  });
};

const launchCredits = (credits) => {
  if (document.getElementById('wrapper')) {
    document.getElementById('wrapper').remove();
  }
  const wrapper = document.createElement('div');
  wrapper.id = 'wrapper';
  wrapper.appendChild(createDiv('job', 'Thanks for watching'));
  credits.games.forEach((game) => { wrapper.appendChild(createDiv('game', game)); });
  wrapper.appendChild(createDiv('job', 'Hosted by'));
  wrapper.appendChild(createDiv('name', window.config.channel));
  addAchievements(wrapper, credits.achievements);
  addCategory(wrapper, 'Donators', credits.donators);
  addCategory(wrapper, 'Subscribes', credits.subscribes);
  addCategory(wrapper, 'Hosts', credits.hosts);
  addCategory(wrapper, 'Follows', credits.follows);
  addCategory(wrapper, 'Viewers', credits.viewers);
  window.document.body.appendChild(wrapper);
};

const getCredits = async () => {
  const res = await fetch('/api/credits');
  if (!res.ok) {
    throw new Error('couldnt fetch credits');
  }
  return res.json();
};

getCredits().then(launchCredits);
