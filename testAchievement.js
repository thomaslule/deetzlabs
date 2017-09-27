const showAchievement = require('./showAchievement');

module.exports = (callback) => {
  showAchievement({
    achievement: 'Testeuse',
    username: 'Berzingator2000',
    text: '%USER% bidouille des trucs',
  }, callback);
};
