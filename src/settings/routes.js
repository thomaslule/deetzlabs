const { Router } = require('express');
const { check } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');
const { validationMiddleware } = require('../util');
const settingsProjection = require('./projections/settings');

module.exports = (closet) => {
  const router = Router();

  router.post(
    '/change_achievement_volume',
    check('volume').isFloat({ min: 0.1, max: 1 }),
    sanitize('volume').toFloat(),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const { volume } = req.validParams;
        await closet.handleCommand('settings', 'settings', 'changeAchievementVolume', { volume });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/change_followers_goal',
    check('goal').isInt({ min: 1 }),
    check('html').exists(),
    check('css').exists(),
    sanitize('goal').toInt(),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const { goal, html, css } = req.validParams;
        await closet.handleCommand('settings', 'settings', 'changeFollowersGoal', { goal, html, css });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get('/achievement_volume', async (req, res, next) => {
    try {
      const proj = await closet.getProjection('settings');
      res.send({ volume: settingsProjection.getAchievementVolume(proj) });
    } catch (err) {
      next(err);
    }
  });

  router.get('/followers_goal', async (req, res, next) => {
    try {
      const proj = await closet.getProjection('settings');
      res.send(settingsProjection.getFollowersGoal(proj));
    } catch (err) {
      next(err);
    }
  });

  return router;
};
