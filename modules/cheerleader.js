const isCommand = require('../util/isCommand');

module.exports = (persist, sendAchievement) => {
  const storeName = 'Pom-pom girl';
  const magicNumber = 5;

  const userSaidGg = (user) => {
    const stored = persist.getItemSync(storeName) || {};
    const { username } = user;
    const currentNumber = stored[username] || 0;
    stored[username] = currentNumber + 1;
    persist.setItemSync(storeName, stored);
    if (stored[username] === magicNumber) {
      sendAchievement({
        achievement: 'cheerleader',
        user: {
          username: user.username,
          'display-name': user['display-name'],
        },
      });
    }
  };

  return {
    receiveMessage: (user, message) => {
      if (isCommand('!gg', message)) {
        userSaidGg(user);
      }
    },
  };
};
