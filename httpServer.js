const express = require('express');
const { Router } = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const logger = require('./logger');
const viewer = require('./viewer/viewer');
const settings = require('./settings/settings');
const achievementDefinitions = require('./achievementDefinitions');

module.exports = (deetzlabs) => {
  const {
    achievementAlert,
    db,
    store,
    bus,
    viewersAchievements,
    displayNames,
    settingsProjection,
  } = deetzlabs;

  const router = Router();

  router.get('/ping', (req, res) => {
    logger.info('received /ping');
    db.stats((err) => {
      if (err) {
        logger.error(err);
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    });
  });

  router.post('/test', (req, res) => {
    logger.info('received /test POST');
    achievementAlert.test()
      .then(() => res.sendStatus(200))
      .catch((e) => {
        logger.error(e);
        res.status(500).send(`${e.name}: ${e.message}`);
      });
  });

  router.post('/alert_volume', (req, res) => {
    const { volume } = req.body;
    logger.info('received POST /alert_volume with volume=%s', volume);
    store.get('settings')
      .then((events) => {
        const s = settings(events);
        return s.changeAchievementVolume(bus, volume);
      })
      .then(() => { res.sendStatus(200); })
      .catch((e) => {
        logger.error(e);
        res.sendStatus(400);
      });
  });

  router.get('/alert_volume', (req, res) => {
    logger.info('received GET /alert_volume');
    res.send({ volume: settingsProjection.getAchievementVolume() });
  });

  router.post('/achievement', (req, res) => {
    logger.info(`received /achievement POST for ${req.body.achievement} ${req.body.user.username}`);
    const id = req.body.user['display-name'].toLowerCase();
    store.get('viewer', id)
      .then((events) => {
        const v = viewer(id, events);
        return v.receiveAchievement(bus, req.body.achievement, req.body.user['display-name']);
      })
      .then(() => { res.sendStatus(200); })
      .catch((e) => {
        logger.error(e);
        res.sendStatus(400);
      });
  });

  router.get('/last_achievements', (req, res) => {
    res.send(viewersAchievements.getLasts());
  });

  router.get('/viewers_achievements', (req, res) => {
    res.send(viewersAchievements.getAll());
  });

  router.get('/all_achievements', (req, res) => {
    res.send(Object.keys(achievementDefinitions));
  });

  router.post('/replay_achievement', (req, res) => {
    const { achievement } = req.body;
    const v = req.body.viewer;
    achievementAlert.display(v, achievement)
      .then(() => { res.sendStatus(200); })
      .catch((e) => {
        logger.error(e);
        res.status(500).send(`${e.name}: ${e.message}`);
      });
  });

  router.get('/viewers', (req, res) => {
    logger.info('received /viewers GET');
    res.send(Object.values(displayNames.getAll()));
  });

  router.post('/chat_message', (req, res) => {
    const { user, message } = req.body;
    const id = user['display-name'].toLowerCase();
    store.get('viewer', id)
      .then((events) => {
        const v = viewer(id, events);
        return v.chatMessage(bus, user['display-name'], message);
      }).then(() => {
        res.sendStatus(200);
      });
  });

  router.post('/cheer', (req, res) => {
    logger.info(`received POST /cheer by ${req.body.displayName}`);
    const { displayName, message, amount } = req.body;
    const id = displayName.toLowerCase();
    store.get('viewer', id)
      .then((events) => {
        const v = viewer(id, events);
        return v.cheer(bus, displayName, message, amount);
      })
      .then(() => { res.sendStatus(200); })
      .catch((e) => {
        logger.error(e);
        res.sendStatus(400);
      });
  });

  router.post('/subscription', (req, res) => {
    logger.info(`received POST /subscription by ${req.body.user}`);
    const id = req.body.user.toLowerCase();
    store.get('viewer', id)
      .then((events) => {
        const v = viewer(id, events);
        return v.subscribe(bus, req.body.method, req.body.message, req.body.user);
      })
      .then(() => { res.sendStatus(200); })
      .catch((e) => {
        logger.error(e);
        res.sendStatus(400);
      });
  });

  const app = express();
  app.use(bodyParser.json());
  app.use(config.get('base_path'), router);

  return app;
};
