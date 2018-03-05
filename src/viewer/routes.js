const { Router } = require('express');
const { check } = require('express-validator/check');
const { validationMiddleware } = require('../util');

module.exports = (closet) => {
  const router = Router();
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

  return router;
};
