const isCommand = require('../util/isCommand');

module.exports = (getAchievements, sendMessage) => {
  const userRequestedAchievements = (user) => {
    const list = getAchievements(user.username);
    if (list.length > 0) {
      sendMessage(`Bravo ${user['display-name']} pour tes succès : ${list.join(', ')} !`);
    } else {
      sendMessage(`${user['display-name']} n'a pas encore de succès, déso.`);
    }
  };

  const receiveMessage = (user, message) => {
    if (isCommand('!succès', message) || isCommand('!succes', message) || isCommand('!success', message)) {
      userRequestedAchievements(user);
    }
  };

  return { receiveMessage };
};
