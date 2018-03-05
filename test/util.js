const nock = require('nock');

const mockAchievement = (achievementName, achievementText, viewerName = 'Someone', volume = 0.5) => (
  nock('http://localhost:3103')
    .post('/achievement', {
      achievementName,
      achievementText,
      viewerName,
      volume,
    })
    .reply(200)
);

module.exports = { mockAchievement };
