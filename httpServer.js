const express = require('express');
const { Router } = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const morgan = require('morgan');
const { log } = require('./logger');
const Viewer = require('./viewer/viewer');
const Settings = require('./settings/settings');
const achievementDefinitions = require('./achievementDefinitions');

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
    db.stats()
      .then(okCallback(res))
      .catch(next);
  });

  router.post('/test', (req, res, next) => {
    achievementAlert.test()
      .then(okCallback(res))
      .catch(next);
  });

  router.post('/alert_volume', (req, res, next) => {
    const { volume } = req.body;
    store.get('settings')
      .then((events) => {
        const s = Settings(events);
        return s.changeAchievementVolume(bus, volume);
      })
      .then(okCallback(res))
      .catch(next);
  });

  router.get('/alert_volume', (req, res) => {
    res.send({ volume: settings.getAchievementVolume() });
  });

  router.post('/achievement', (req, res, next) => {
    const id = req.body.user['display-name'].toLowerCase();
    store.get('viewer', id)
      .then((events) => {
        const viewer = Viewer(id, events);
        return viewer.receiveAchievement(bus, req.body.achievement, req.body.user['display-name']);
      })
      .then(okCallback(res))
      .catch(next);
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

  router.post('/replay_achievement', (req, res, next) => {
    const { achievement } = req.body;
    const v = req.body.viewer;
    achievementAlert.display(v, achievement)
      .then(okCallback(res))
      .catch(next);
  });

  router.get('/viewers', (req, res) => {
    res.send(Object.values(displayNames.getAll()));
  });

  router.post('/chat_message', (req, res, next) => {
    const { user, message } = req.body;
    const id = user['display-name'].toLowerCase();
    store.get('viewer', id)
      .then((events) => {
        const viewer = Viewer(id, events);
        return viewer.chatMessage(bus, user['display-name'], message);
      })
      .then(okCallback(res))
      .catch(next);
  });

  router.post('/cheer', (req, res, next) => {
    const { displayName, message, amount } = req.body;
    const id = displayName.toLowerCase();
    store.get('viewer', id)
      .then((events) => {
        const viewer = Viewer(id, events);
        return viewer.cheer(bus, displayName, message, amount);
      })
      .then(okCallback(res))
      .catch(next);
  });

  router.post('/subscription', (req, res, next) => {
    const id = req.body.user.toLowerCase();
    store.get('viewer', id)
      .then((events) => {
        const viewer = Viewer(id, events);
        return viewer.subscribe(bus, req.body.method, req.body.message, req.body.user);
      })
      .then(okCallback(res))
      .catch(next);
  });

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
