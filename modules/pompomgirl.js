const isCommand = require('../util/isCommand');

const pompomgirl = (persist, sendAchievement) => {
  const achievementName = 'Pom-pom girl';
  const magicNumber = 5;

  const userSaidGg = (user) => {
    const stored = persist.getItemSync(achievementName) || {};
    const { username } = user;
    const currentNumber = stored[username] || 0;
    stored[username] = currentNumber + 1;
    persist.setItemSync(achievementName, stored);
    if (stored[username] === magicNumber) {
      sendAchievement({
        achievement: achievementName,
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

module.exports = pompomgirl;
