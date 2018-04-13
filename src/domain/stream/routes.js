const { Router } = require('express');
const { check } = require('express-validator/check');
const { validationMiddleware } = require('../util');

module.exports = (closet) => {
  const router = Router();

  router.post(
    '/stream_begins',
    check('game').not().isEmpty(),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const { game } = req.validParams;
        await closet.handleCommand('stream', 'stream', 'begin', { game });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/stream_change_game',
    check('game').not().isEmpty(),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const { game } = req.validParams;
        await closet.handleCommand('stream', 'stream', 'changeGame', { game });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/stream_ends',
    async (req, res, next) => {
      try {
        await closet.handleCommand('stream', 'stream', 'end');
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
