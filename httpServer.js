const express = require('express');
const { Router } = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const morgan = require('morgan');
const { check } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');
const mapValues = require('lodash/mapValues');
const { log } = require('./logger');
const achievements = require('./achievements');
const validationMiddleware = require('./util/validationMiddleware');

const okCallback = res => () => { res.sendStatus(200); };

module.exports = ({
  viewerStore,
  streamStore,
  settingsStore,
  achievementAlert,
  viewersAchievements,
  displayNames,
  settings,
}) => {
  const router = Router();

  router.post('/show_test_achievement', async (req, res, next) => {
    try {
      await achievementAlert.test();
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  });

  router.post(
    '/change_achievement_volume',
    check('volume').isFloat({ min: 0.1, max: 1 }),
    sanitize('volume').toFloat(),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const { volume } = req.validParams;
        await settingsStore.add('settings', s => s.changeAchievementVolume(volume));
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get('/achievement_volume', (req, res) => {
    res.send({ volume: settings.getAchievementVolume() });
  });

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
        await settingsStore.add('settings', s => s.changeFollowersGoal({ goal, html, css }));
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get('/followers_goal', (req, res) => {
    res.send(settings.getFollowersGoal());
  });

  router.post(
    '/give_achievement',
    check('achievement').not().isEmpty(),
    check('viewer').not().isEmpty(),
    check('displayName'),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const { achievement, viewer, displayName } = req.validParams;
        await viewerStore.add(viewer, v => v.receiveAchievement(achievement, displayName));
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get('/last_viewer_achievements', (req, res) => {
    res.send(viewersAchievements.getLasts());
  });

  router.get('/all_viewer_achievements', (req, res) => {
    res.send(viewersAchievements.getAll());
  });

  router.get('/all_achievements', (req, res) => {
    res.send(mapValues(achievements, a => ({ name: a.name })));
  });

  router.post(
    '/replay_achievement',
    check('achievement').not().isEmpty(),
    check('viewer').not().isEmpty(),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const { achievement, viewer } = req.validParams;
        await achievementAlert.display(viewer, achievement);
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
        await viewerStore.add(viewer, v => v.chatMessage(displayName, message));
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.get('/viewers', (req, res) => {
    res.send(displayNames.getAll());
  });

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
        await viewerStore.add(viewer, v => v.cheer(displayName, message, amount));
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
        await viewerStore.add(viewer, v => v.subscribe(displayName, message, method));
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
        await viewerStore.add(viewer, v => v.resub(displayName, message, method, months));
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/join',
    check('viewer').not().isEmpty(),
    check('displayName'),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const { viewer, displayName } = req.validParams;
        await viewerStore.add(viewer, v => v.join(displayName));
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
        const { viewer, displayName } = req.validParams;
        await viewerStore.add(viewer, v => v.leave(displayName));
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
        await viewerStore.add(viewer, v => v.host(nbViewers));
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/stream_begins',
    check('game').not().isEmpty(),
    validationMiddleware,
    async (req, res, next) => {
      try {
        const { game } = req.validParams;
        await streamStore.add('stream', stream => stream.begin(game));
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
        await streamStore.add('stream', stream => stream.changeGame(game));
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
        await streamStore.add('stream', stream => stream.end());
        res.sendStatus(200);
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/migrate_data',
    (req, res, next) => {
      const getStorage = name => req.body.find(d => d.key === name).value;
      const promises = getStorage('viewers').map((displayName) => {
        const id = displayName.toLowerCase();
        const achs = getStorage('achievements')
          .filter(a => a.username === id)
          .map(a => ({ achievement: a.achievement, date: a.date }));
        const entertainer = Number(getStorage('count_messages')[id] || 0);
        const vigilante = Number(getStorage('vigilante')[id] || 0);
        const cheerleader = Number(getStorage('cheerleader')[id] || 0);
        const gravedigger = Number(getStorage('gravedigger')[id] || 0);
        const swedish = Number(getStorage('swedish')[id] || 0);
        const careful = Number(getStorage('careful')[id] || 0);
        const berzingue = Number(getStorage('berzingue')[id] || 0);

        return viewerStore.add(id, v => v.migrateData({
          achievements: achs,
          displayName,
          entertainer,
          vigilante,
          cheerleader,
          gravedigger,
          swedish,
          careful,
          berzingue,
        }));
      });
      return Promise.all(promises)
        .then(okCallback(res))
        .catch(next);
    },
  );
  const app = express();
  app.use(bodyParser.json());
  const s = { write: message => log.info(message.slice(0, -1)) };
  app.use(morgan(':remote-addr ":method :url" - :status - :response-time ms', { stream: s }));
  app.use(config.get('base_path'), router);

  app.use((err, req, res, next) => {
    log.error(err);
    if (err.message.startsWith('bad_request')) {
      res.status(400).send({ error: err.message });
    } else {
      res.sendStatus(500);
    }
    next();
  });

  return app;
};
