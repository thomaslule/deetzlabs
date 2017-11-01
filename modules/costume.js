const pickOne = array => array[Math.floor(Math.random() * array.length)];

module.exports = (persist, sendMessage) => {
  const storeName = 'costume';
  const costumes = [
    'sorcière',
    'cafard',
    'vampire émo',
    'chauve-souris',
    'squelette de poney',
    'polochon le robot',
    'catcoon',
    'reine araignée de Don\'t Starve',
    'crocodile de Tomb Raider 1',
    'IA maléfique',
    'xénomorphe',
    'linuxien-ne zombie',
  ];
  let currentCostumes = [...costumes];

  const welcomeMessage = (viewer, costume) => {
    const messages = [
      `${viewer} débarque déguisé-e en ${costume}`,
      `Voilà ${viewer} en costume de ${costume}`,
      `Salut ${viewer}, trop bien ton costume de ${costume}`,
      `Soudain voilà ${viewer} habillé-e en ${costume}`,
    ];
    const comment = [', creepy !', ', la classe !', ', c\'est FABULOUS', '... Flippant/10.'];
    return pickOne(messages) + pickOne(comment);
  };

  const userSaidSomething = (user) => {
    const date = (new Date()).getDate();
    if (date < 3 || date > 4) return;
    const stored = persist.getItemSync(storeName) || {};
    const { username } = user;
    if (stored[username]) return;
    const costume = pickOne(currentCostumes);
    stored[username] = costume;
    persist.setItemSync(storeName, stored);
    currentCostumes = currentCostumes.filter(c => c !== costume);
    if (currentCostumes.length === 0) currentCostumes = [...costumes];
    sendMessage(welcomeMessage(user['display-name'], costume));
  };

  return {
    receiveMessage: (user) => {
      userSaidSomething(user);
    },
  };
};
