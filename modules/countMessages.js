module.exports = (persist, sendAchievement) => {
  const storeName = 'count_messages';
  const magicNumber = 300;

  const userSaidSomething = (user) => {
    const stored = persist.getItemSync(storeName) || {};
    const { username } = user;
    const currentNumber = stored[username] || 0;
    stored[username] = currentNumber + 1;
    persist.setItemSync(storeName, stored);
    if (stored[username] === magicNumber) {
      sendAchievement({
        achievement: 'entertainer',
        user: {
          username: user.username,
          'display-name': user['display-name'],
        },
      });
    }
  };

  return {
    receiveMessage: (user) => {
      userSaidSomething(user);
    },
  };
};
