const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./logger');
const config = require('./config');
const viewer = require('./viewer/viewer');

module.exports = (deetzlabs) => {
  const {
    achievement,
    viewers,
    commands,
    succes,
    achievementAlert,
    db,
    store,
    bus,
    viewersAchievements,
  } = deetzlabs;

  const handleError = (error, res, next) => {
    if (error) {
      res.status(500).send(`${error.name}: ${error.message}`);
    } else {
      next();
    }
  };

  const app = express();
  app.use(bodyParser.json());

  app.get(`${config.root_server_path}/ping`, (req, res) => {
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

  app.post(`${config.root_server_path}/test`, (req, res) => {
    logger.info('received /test POST');
    achievementAlert.test((error) => {
      handleError(error, res, () => {
        res.sendStatus(200);
      });
    });
  });

  app.post(`${config.root_server_path}/alert_volume`, (req, res) => {
    logger.info('received POST /alert_volume with volume=%s', req.body.volume);
    achievementAlert.setVolume(req.body.volume);
    res.sendStatus(200);
  });

  app.get(`${config.root_server_path}/alert_volume`, (req, res) => {
    logger.info('received GET /alert_volume');
    const volume = achievementAlert.getVolume();
    res.send({ volume });
  });

  app.post(`${config.root_server_path}/achievement`, (req, res) => {
    logger.info(`received /achievement POST for ${req.body.achievement} ${req.body.user.username}`);
    const id = req.body.user['display-name'].toLowerCase();
    store.get(id)
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

  app.get(`${config.root_server_path}/last_achievements`, (req, res) => {
    res.send(achievement.getLasts());
  });

  app.get(`${config.root_server_path}/viewers_achievements`, (req, res) => {
    res.send(viewersAchievements.getAll());
  });

  app.get(`${config.root_server_path}/all_achievements`, (req, res) => {
    res.send(achievement.getList());
  });

  app.post(`${config.root_server_path}/replay_achievement`, (req, res) => {
    achievement.replay(req.body.achievement, req.body.username);
    res.sendStatus(200);
  });

  app.get(`${config.root_server_path}/viewers`, (req, res) => {
    logger.info('received /viewers GET');
    const viewersList = viewers.get();
    res.send(viewersList);
  });

  app.post(`${config.root_server_path}/chat_message`, (req, res) => {
    const { user, message } = req.body;
    [
      viewers,
      commands,
      succes,
    ].forEach(obj => obj.receiveMessage(user, message));
    const id = user['display-name'].toLowerCase();
    store.get('viewer', id)
      .then((events) => {
        const v = viewer(id, events);
        return v.chatMessage(bus, user['display-name'], message);
      }).then(() => {
        res.sendStatus(200);
      });
  });

  app.post(`${config.root_server_path}/cheer`, (req, res) => {
    logger.info(`received POST /cheer by ${req.body.displayName}`);
    const { displayName, message, amount } = req.body;
    const id = displayName.toLowerCase();
    store.get(id)
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

  app.post(`${config.root_server_path}/subscription`, (req, res) => {
    logger.info(`received POST /subscription by ${req.body.user}`);
    const id = req.body.user.toLowerCase();
    store.get(id)
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

  return app;
};
