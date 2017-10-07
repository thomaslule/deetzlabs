const isCommand = require('../util/isCommand');

module.exports = (getAchievements, sendMessage) => {
  const userRequestedAchievements = (user) => {
    getAchievements(user.username, (error, list) => {
      if (error) {
        sendMessage('Je saurais pas dire... je suis un peu en panne en fait.');
      } else if (list.length > 0) {
        sendMessage(`Bravo ${user['display-name']} pour tes succès : ${list.join(', ')} !`);
      } else {
        sendMessage(`${user['display-name']} n'a pas encore de succès, déso.`);
      }
    });
  };

  return {
    receiveMessage: (user, message) => {
      if (isCommand('!succès', message)) {
        userRequestedAchievements(user);
      }
    },
  };
};
