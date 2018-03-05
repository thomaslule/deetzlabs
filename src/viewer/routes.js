const { Router } = require('express');
const { check } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');
const { validationMiddleware } = require('../util');
const distributedAchievementsProjection = require('./distributedAchievementsProjection');

module.exports = (closet) => {
  const router = Router();

  router.post(
    '/give_achievement',
    check('achievement').not().isEmpty(),
    check('viewer').not().isEmpty(),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const { achievement, viewer } = req.validParams;
        await closet.handleCommand('viewer', viewer, 'giveAchievement', { achievement });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/send_chat_message',
    check('viewer').not().isEmpty(),
    check('displayName'),
    check('message').not().isEmpty(),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const { viewer, displayName, message } = req.validParams;
        await closet.handleCommand('viewer', viewer, 'chatMessage', { message, displayName });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/cheer',
    check('viewer').not().isEmpty(),
    check('displayName'),
    check('message').not().isEmpty(),
    check('amount').isInt(),
    sanitize('amount').toInt(),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const {
          viewer, displayName, message, amount,
        } = req.validParams;
        await closet.handleCommand('viewer', viewer, 'cheer', { message, amount, displayName });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/donate',
    check('viewer').not().isEmpty(),
    check('amount').isFloat(),
    sanitize('amount').toFloat(),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const { viewer, amount } = req.validParams;
        await closet.handleCommand('viewer', viewer, 'donate', { amount });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/subscribe',
    check('viewer').not().isEmpty(),
    check('displayName'),
    check('message'),
    check('method'),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const {
          viewer, displayName, message, method,
        } = req.validParams;
        await closet.handleCommand('viewer', viewer, 'subscribe', { message, method, displayName });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/resub',
    check('viewer').not().isEmpty(),
    check('displayName'),
    check('message'),
    check('methods'),
    check('months').isInt(),
    sanitize('months').toInt(),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const {
          viewer, displayName, message, method, months,
        } = req.validParams;
        await closet.handleCommand('viewer', viewer, 'resub', {
          message, method, months, displayName,
        });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/join',
    check('viewer').not().isEmpty(),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const { viewer } = req.validParams;
        await closet.handleCommand('viewer', viewer, 'join');
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/leave',
    check('viewer').not().isEmpty(),
    check('displayName'),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const { viewer } = req.validParams;
        await closet.handleCommand('viewer', viewer, 'leave');
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/host',
    check('viewer').not().isEmpty(),
    check('nbViewers').isInt(),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const { viewer, nbViewers } = req.validParams;
        await closet.handleCommand('viewer', viewer, 'host', { nbViewers });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/follow',
    check('viewer').not().isEmpty(),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const { viewer } = req.validParams;
        await closet.handleCommand('viewer', viewer, 'follow');
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get('/all_viewer_achievements', async (req, res, next) => {
    try {
      const proj = await closet.getProjection('distributedAchievements');
      res.send(distributedAchievementsProjection.getAll(proj));
    } catch (err) {
      next(err);
    }
  });

  return router;
};
