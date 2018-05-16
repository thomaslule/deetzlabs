const { Router } = require('express');
const { check } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');
const { validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');
const jwt = require('jsonwebtoken');
const expressjwt = require('express-jwt');
const crypto = require('crypto');
const distributedAchievementsProjection = require('./domain/viewer/projections/distributedAchievements');
const displayNamesProjection = require('./domain/viewer/projections/displayNames');
const settingsProjection = require('./domain/settings/projections/settings');
const creditsProjection = require('./domain/credits/projection');

const LOGIN_DURATION = 60 * 60 * 24 * 30;

const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.mapped() });
    return;
  }
  req.validParams = matchedData(req);
  next();
};

module.exports = (closet, options) => {
  const router = Router();

  if (options.protect_api) {
    router.use(expressjwt({
      secret: options.secret,
    }).unless({ path: ['/api/login', '/api/followers_goal', '/api/credits'] }));
  }

  router.post(
    '/login',
    check('username').exists(),
    check('password').exists(),
    validationMiddleware,
    (req, res, next) => {
      try {
        if (options.protect_api) {
          const { username, password } = req.validParams;
          const { logins } = options;
          if (logins[username] && logins[username] === crypto.createHash('sha256').update(password).digest('base64')) {
            const token = jwt.sign({ username }, options.secret, { expiresIn: LOGIN_DURATION });
            const expiresAt = Date.now() + (LOGIN_DURATION * 1000);
            res.send({ token, expiresAt });
          } else {
            res.sendStatus(401);
          }
        } else {
          res.send('DUMMY_TOKEN');
        }
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

  router.get('/last_viewer_achievements', async (req, res, next) => {
    try {
      const proj = await closet.getProjection('distributedAchievements');
      res.send(distributedAchievementsProjection.getLasts(proj));
    } catch (err) {
      next(err);
    }
  });

  router.get('/viewers', async (req, res, next) => {
    try {
      const proj = await closet.getProjection('displayNames');
      res.send(displayNamesProjection.getAll(proj));
    } catch (err) {
      next(err);
    }
  });

  router.get('/all_achievements', (req, res, next) => {
    try {
      const all = Object.keys(options.achievements)
        .reduce((result, a) => (
          { ...result, [a]: { name: options.achievements[a].name } }
        ), {});
      res.send(all);
    } catch (err) {
      next(err);
    }
  });

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

  router.get('/credits', async (req, res, next) => {
    try {
      const [credits, displayNames] = await Promise.all([
        closet.getProjection('credits'),
        closet.getProjection('displayNames'),
      ]);
      res.send(creditsProjection.get(
        credits,
        id => displayNamesProjection.get(displayNames, id),
        options.achievements,
      ));
    } catch (err) {
      next(err);
    }
  });

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
    '/replay_achievement',
    check('achievement').not().isEmpty(),
    check('viewer').not().isEmpty(),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const { achievement, viewer } = req.validParams;
        await closet.handleCommand('viewer', viewer, 'replayAchievement', { achievement });
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/show_test_achievement',
    async (req, res, next) => {
      try {
        await closet.handleCommand('viewer', options.bot_name.toLowerCase(), 'replayAchievement', { achievement: 'testing' });
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

  return router;
};
