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
  wrapper.appendChild(createDiv('job', 'Merci d\'avoir regardé'));
  credits.games.forEach((game) => { wrapper.appendChild(createDiv('game', game)); });
  wrapper.appendChild(createDiv('job', 'Présenté par'));
  wrapper.appendChild(createDiv('name', 'Deetz'));
  addAchievements(wrapper, credits.achievements);
  addCategory(wrapper, 'Soutiens', credits.donators);
  addCategory(wrapper, 'Couronnements', credits.subscribes);
  addCategory(wrapper, 'Diffusions', credits.hosts);
  addCategory(wrapper, 'Nouvelles chauves-souris', credits.follows);
  addCategory(wrapper, 'Chauves-souris', credits.viewers);
  window.document.body.appendChild(wrapper);
};

const getCredits = async () => {
  const res = await fetch(`${window.config.public_server.root_path}/widgets/credits_data`);
  if (!res.ok) {
    throw new Error('couldnt fetch credits');
  }
  return res.json();
};

getCredits().then(launchCredits);
