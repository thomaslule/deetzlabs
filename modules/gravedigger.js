const isCommand = require('../util/isCommand');

const magicNumber = 5;

const gravedigger = (persist, sendAchievement) => {
  const storeName = 'gravedigger';

  const userSaidRip = (user) => {
    const stored = persist.getItemSync(storeName) || {};
    const { username } = user;
    const currentNumber = stored[username] || 0;
    stored[username] = currentNumber + 1;
    persist.setItemSync(storeName, stored);
    if (stored[username] === magicNumber) {
      sendAchievement({
        achievement: 'gravedigger',
        user: {
          username: user.username,
          'display-name': user['display-name'],
        },
      });
    }
  };

  return {
    receiveMessage: (user, message) => {
      if (isCommand('!rip', message)) {
        userSaidRip(user);
      }
    },
  };
};

module.exports = gravedigger;
