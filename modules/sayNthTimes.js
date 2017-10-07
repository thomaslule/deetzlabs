module.exports = (persist, sendAchievement, testMessage, timesToUnlock, achievementCode) => {
  const userSaidItRight = (user) => {
    const stored = persist.getItemSync(achievementCode) || {};
    const { username } = user;
    const currentNumber = stored[username] || 0;
    stored[username] = currentNumber + 1;
    persist.setItemSync(achievementCode, stored);
    if (stored[username] === timesToUnlock) {
      sendAchievement({
        achievement: achievementCode,
        user: {
          username: user.username,
          'display-name': user['display-name'],
        },
      });
    }
  };

  return {
    receiveMessage: (user, message) => {
      if (testMessage(message)) {
        userSaidItRight(user);
      }
    },
  };
};
