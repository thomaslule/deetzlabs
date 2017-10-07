module.exports = (persist, showAchievement, getDisplayName) => {
  const storeName = 'achievements';
  const achievementsDefinitions = [
    {
      code: 'test',
      name: 'Testeuse',
      text: '%USER% bidouille des trucs',
    },
    {
      code: 'swedish',
      name: 'Suédois LV1',
      text: 'Hej %USER% !',
    },
    {
      code: 'gravedigger',
      name: 'Fossoyeuse',
      text: '%USER% est un peu sadique...',
    },
    {
      code: 'cheerleader',
      name: 'Pom-pom girl',
      text: 'Merci pour tes encouragements %USER% !',
    },
    {
      code: 'benefactor',
      name: 'Mécène',
      text: 'Cool ! Merci pour ton soutien %USER%',
    },
    {
      code: 'entertainer',
      name: 'Ambianceuse',
      text: 'Bim plein de messages dans le chat, gg %USER%',
    },
    {
      code: 'berzingue',
      name: 'Berzingos',
      text: 'L\'esprit de la berzingue est avec %USER% !',
    },
  ];

  const achEquals = (stored, code, username) =>
    stored.username === username && stored.achievement === code;

  const received = (achievement, callback = () => {}) => {
    const achDefinition = achievementsDefinitions.find(def => def.code === achievement.achievement);
    if (achDefinition) {
      const stored = persist.getItemSync(storeName) || [];
      const { username } = achievement.user;
      if (!stored.find(a => achEquals(a, achDefinition.code, username))) {
        stored.push({
          username,
          achievement: achDefinition.code,
        });
        persist.setItemSync(storeName, stored);
        showAchievement({
          achievement: achDefinition.name,
          username: achievement.user['display-name'],
          text: achDefinition.text,
        }, callback);
      } else {
        callback('achievement already given');
      }
    } else {
      callback('unknown achievement');
    }
  };

  const get = (username) => {
    const stored = persist.getItemSync(storeName) || [];
    return stored
      .filter(a => a.username === username)
      .map(a => a.achievement)
      .map(code => achievementsDefinitions.find(def => def.code === code).name);
  };

  const getLasts = () => {
    const stored = persist.getItemSync(storeName) || [];
    return stored
      .slice(-5)
      .reverse()
      .map(ach => ({ achievement: ach.achievement, username: getDisplayName(ach.username) }));
  };

  return { received, get, getLasts };
};
