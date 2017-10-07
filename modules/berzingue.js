const isCommand = require('../util/isCommand');

module.exports = (persist, sendAchievement) => {
  const code = 'berzingue';
  const magicNumber = 5;

  const userSaidBerzingue = (user) => {
    const stored = persist.getItemSync(code) || {};
    const { username } = user;
    const currentNumber = stored[username] || 0;
    stored[username] = currentNumber + 1;
    persist.setItemSync(code, stored);
    if (stored[username] === magicNumber) {
      sendAchievement({
        achievement: code,
        user: {
          username: user.username,
          'display-name': user['display-name'],
        },
      });
    }
  };

  return {
    receiveMessage: (user, message) => {
      if (isCommand('!berzingue', message)) {
        userSaidBerzingue(user);
      }
    },
  };
};
