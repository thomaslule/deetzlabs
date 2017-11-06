const moment = require('moment');

module.exports = (persist, showAchievement, getDisplayName) => {
  const storeName = 'achievements';
  const achievementsDefinitions = [
    {
      code: 'Testeuse',
      name: 'Testeuse',
      text: '%USER% bidouille des trucs',
    },
    {
      code: 'Suédois LV1',
      name: 'Suédois LV1',
      text: 'Hej %USER% !',
    },
    {
      code: 'Fossoyeuse',
      name: 'Fossoyeuse',
      text: '%USER% est un peu sadique...',
    },
    {
      code: 'Pom-pom girl',
      name: 'Pom-pom girl',
      text: 'Merci pour tes encouragements %USER% !',
    },
    {
      code: 'Mécène',
      name: 'Mécène',
      text: 'Cool ! Merci pour ton soutien %USER%',
    },
    {
      code: 'Ambianceuse',
      name: 'Ambianceuse',
      text: 'Bim plein de messages dans le chat, gg %USER%',
    },
    {
      code: 'Berzingos',
      name: 'Berzingos',
      text: '%USER% dépasse le mur du son !',
    },
    {
      code: 'Prudente',
      name: 'Prudente',
      text: '%USER% nous montre la voie de la sagesse',
    },
    {
      code: 'Vigilance constante',
      name: 'Vigilance constante',
      text: '%USER% ne laisse rien passer !',
    },
    {
      code: 'Hallowinneuse',
      name: 'Hallowinneuse',
      text: '%USER% a l\'oreille absolue !',
    },
    {
      code: 'Despacitrouille',
      name: 'Despacitrouille',
      text: '%USER% connaît ses classiques !',
    },
    {
      code: 'Hercule Poirette',
      name: 'Hercule Poirette',
      text: '%USER% mène l\'enquête !',
    },
  ];

  const codeToName = code => achievementsDefinitions.find(def => def.code === code).name;

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
          date: moment().format('YYYY-MM-DD'),
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
      .map(codeToName);
  };

  const getLasts = () => {
    const stored = persist.getItemSync(storeName) || [];
    return stored
      .slice(-5)
      .reverse()
      .map(ach => (
        {
          username: getDisplayName(ach.username),
          achievement: { code: ach.achievement, name: codeToName(ach.achievement) },
        }));
  };

  const getAll = () => {
    const stored = persist.getItemSync(storeName) || [];
    return stored
      .map(ach => (
        {
          username: getDisplayName(ach.username),
          achievement: { code: ach.achievement, name: codeToName(ach.achievement) },
        }));
  };

  const getList = () => achievementsDefinitions;

  const replay = (achievement, username) => {
    const definition = achievementsDefinitions.find(def => def.code === achievement);
    showAchievement({
      achievement: definition.name,
      username,
      text: definition.text,
    });
  };

  return {
    received, get, getLasts, getAll, getList, replay,
  };
};
