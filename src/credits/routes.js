const { Router } = require('express');
const creditsProjection = require('./projection');
const displayNamesProjection = require('../viewer/projections/displayNames');

module.exports = (closet) => {
  const router = Router();

  router.get(
    '/credits',
    async (req, res, next) => {
      try {
        const credits = await closet.getProjection('credits');
        const displayNames = await closet.getProjection('displayNames');
        const getDisplayName = id => displayNamesProjection.get(displayNames, id);
        res.send(creditsProjection.get(credits, getDisplayName));
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
