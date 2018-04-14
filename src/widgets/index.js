const express = require('express');
const { Router } = require('express');
const { getFollowersGoal } = require('../domain/settings/projections/settings');
const getCredits = require('../domain/credits/projection').get;
const getDisplayName = require('../domain/viewer/projections/displayNames').get;

module.exports = (closet, socket) => {
  const router = Router();

  router.use('/', express.static('src/widgets/public'));

  router.get('/followers_goal_settings', async (req, res, next) => {
    try {
      const settings = await closet.getProjection('settings');
      res.send(getFollowersGoal(settings));
    } catch (err) {
      next(err);
    }
  });

  router.get('/credits_data', async (req, res, next) => {
    try {
      const [credits, displayNames] = await Promise.all([
        closet.getProjection('credits'),
        closet.getProjection('displayNames'),
      ]);
      res.send(getCredits(credits, id => getDisplayName(displayNames, id)));
    } catch (err) {
      next(err);
    }
  });

  const getRouter = () => router;

  const showAchievement = (achievement, text, username, volume) => {
    socket.emit('achievement', {
      achievement, username, text, volume,
    });
  };

  return {
    getRouter,
    showAchievement,
  };
};
