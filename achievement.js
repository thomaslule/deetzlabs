const achievementTexts = require('./achievementTexts');
const logger = require('./logger');

module.exports = (persist, showAchievement) => {
  const storeName = 'achievements';

  const achEquals =
  (storedAchievement, currentAchievement) =>
    storedAchievement.username === currentAchievement.user.username
    && storedAchievement.achievement === currentAchievement.achievement;

  return {
    received: (achievement, callback) => {
      const stored = persist.getItemSync(storeName) || [];
      if (stored.filter(a => achEquals(a, achievement)).length === 0) {
        stored.push({
          username: achievement.user.username,
          achievement: achievement.achievement,
        });
        persist.setItemSync(storeName, stored);
        showAchievement({
          achievement: achievement.achievement,
          username: achievement.user['display-name'],
          text: achievementTexts[achievement.achievement] || achievementTexts.default,
        }, callback);
      } else {
        logger.info('achievement %s for %s already exists', achievement.achievement, achievement.user.username);
        callback();
      }
    },
    get: (username, callback) => {
      const stored = persist.getItemSync(storeName) || [];
      callback(null, stored.filter(a => a.username === username).map(a => a.achievement));
    },
  };
};
