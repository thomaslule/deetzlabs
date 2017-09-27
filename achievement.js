const achievementTexts = require('./achievementTexts');

module.exports = (persist, showAchievement) => {
  const storeName = 'achievements';

  const achEquals =
  (storedAchievement, currentAchievement) =>
    storedAchievement.username === currentAchievement.user.username
    && storedAchievement.achievement === currentAchievement.achievement;

  return {
    received: (achievement, callback) => {
      persist.getItem(storeName)
        .then((stored = []) => {
          if (stored.filter(a => achEquals(a, achievement)).length === 0) {
            stored.push({
              username: achievement.user.username,
              achievement: achievement.achievement,
            });
            persist.setItem(storeName, stored);
            showAchievement({
              achievement: achievement.achievement,
              username: achievement.user['display-name'],
              text: achievementTexts[achievement.achievement] || achievementTexts.default,
            });
          }
          callback();
        });
    },
    get: (username, callback) => {
      persist.getItem(storeName)
        .then((stored = []) => {
          callback(null, stored.filter(a => a.username === username).map(a => a.achievement));
        });
    },
  };
};
