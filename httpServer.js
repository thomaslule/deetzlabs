const express = require('express');
const { Router } = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const morgan = require('morgan');
const { check } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');
const mapValues = require('lodash/mapValues');
const { log } = require('./logger');
const Viewer = require('./viewer/viewer');
const achievements = require('./achievements');
const Settings = require('./settings/settings');
const validationMiddleware = require('./util/validationMiddleware');

const okCallback = res => () => { res.sendStatus(200); };

module.exports = ({
  db,
  store,
  bus,
  achievementAlert,
  viewersAchievements,
  displayNames,
  settings,
}) => {
  const router = Router();

  router.get('/ping', (req, res, next) => {
    db.query('SELECT $1::text as message', ['Hello world!'])
      .then(okCallback(res))
      .catch(next);
  });

  router.post('/show_test_achievement', (req, res, next) => {
    achievementAlert.test()
      .then(okCallback(res))
      .catch(next);
  });

  router.post(
    '/change_achievement_volume',
    check('volume').isFloat({ min: 0.1, max: 1 }),
    sanitize('volume').toFloat(),
    validationMiddleware,
    (req, res, next) => {
      const { volume } = req.validParams;
      store.get('settings')
        .then((events) => {
          const s = Settings(events);
          return s.changeAchievementVolume(bus, volume);
        })
        .then(okCallback(res))
        .catch(next);
    },
  );

  router.get('/achievement_volume', (req, res) => {
    res.send({ volume: settings.getAchievementVolume() });
  });

  router.post(
    '/give_achievement',
    check('achievement').not().isEmpty(),
    check('viewer').not().isEmpty(),
    check('displayName'),
    validationMiddleware,
    (req, res, next) => {
      const { achievement, viewer, displayName } = req.validParams;
      store.get('viewer', viewer)
        .then((events) => {
          const v = Viewer(viewer, events);
          return v.receiveAchievement(bus, achievement, displayName);
        })
        .then(okCallback(res))
        .catch(next);
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
    (req, res, next) => {
      const { achievement, viewer } = req.validParams;
      achievementAlert.display(viewer, achievement)
        .then(okCallback(res))
        .catch(next);
    },
  );

  router.post(
    '/send_chat_message',
    check('viewer').not().isEmpty(),
    check('displayName'),
    check('message').not().isEmpty(),
    validationMiddleware,
    (req, res, next) => {
      const { viewer, displayName, message } = req.validParams;
      store.get('viewer', viewer)
        .then((events) => {
          const v = Viewer(viewer, events);
          return v.chatMessage(bus, displayName, message);
        })
        .then(okCallback(res))
        .catch(next);
    },
  );

  router.get('/viewers', (req, res) => {
    res.send(displayNames.getAll());
  });

  router.post(
    '/send_cheer',
    check('viewer').not().isEmpty(),
    check('displayName'),
    check('message').not().isEmpty(),
    check('amount').isInt(),
    sanitize('amount').toInt(),
    validationMiddleware,
    (req, res, next) => {
      const {
        viewer, displayName, message, amount,
      } = req.validParams;
      store.get('viewer', viewer)
        .then((events) => {
          const v = Viewer(viewer, events);
          return v.cheer(bus, displayName, message, amount);
        })
        .then(okCallback(res))
        .catch(next);
    },
  );

  router.post(
    '/send_subscription',
    check('viewer').not().isEmpty(),
    check('displayName'),
    check('message'),
    check('method'),
    validationMiddleware,
    (req, res, next) => {
      const {
        viewer, displayName, message, method,
      } = req.validParams;
      store.get('viewer', viewer)
        .then((events) => {
          const v = Viewer(viewer, events);
          return v.subscribe(bus, method, message, displayName);
        })
        .then(okCallback(res))
        .catch(next);
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
        return store.get('viewer', id)
          .then((events) => {
            const viewer = Viewer(id, events);
            return viewer.migrateData(bus, {
              achievements: achs,
              displayName,
              entertainer,
              vigilante,
              cheerleader,
              gravedigger,
              swedish,
              careful,
              berzingue,
            });
          });
      });
      return Promise.all(promises)
        .then(okCallback(res))
        .catch(next);
    },
  );

  const app = express();
  app.use(bodyParser.json());
  const stream = { write: message => log.info(message.slice(0, -1)) };
  app.use(morgan(':remote-addr ":method :url" - :status - :response-time ms', { stream }));
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
