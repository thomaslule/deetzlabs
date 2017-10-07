const isCommand = require('../util/isCommand');

const swedish = (sendAchievement) => {
  const userSaidHej = (user) => {
    sendAchievement({
      achievement: 'swedish',
      user: {
        username: user.username,
        'display-name': user['display-name'],
      },
    });
  };

  return {
    receiveMessage: (user, message) => {
      if (isCommand('hej', message) || isCommand('Hej', message)) {
        userSaidHej(user);
      }
    },
  };
};

module.exports = swedish;
