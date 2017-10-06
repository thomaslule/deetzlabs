const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./logger');
const config = require('./config');
const showAchievement = require('./showAchievement');
const testAchievement = require('./testAchievement');
const achievement = require('./achievement');
const viewers = require('./viewers');
const gravedigger = require('./gravedigger');
const swedish = require('./swedish');
const pompomgirl = require('./pompomgirl');
const commands = require('./commands');
const sendChatMessage = require('./sendChatMessage');
const succes = require('./commandSucces');
const countMessages = require('./countMessages');

module.exports = (storage) => {
  const ach = achievement(storage, showAchievement);
  const view = viewers(storage);
  const gd = gravedigger(storage, ach.received);
  const sw = swedish(ach.received);
  const ppg = pompomgirl(storage, ach.received);
  const comm = commands(sendChatMessage);
  const succ = succes(ach.get, sendChatMessage);
  const count = countMessages(storage, ach.received);

  const onRequest = {
    onPostTest: testAchievement,
    onPostAchievement: ach.received,
    onGetAchievements: ach.get,
    onPostViewer: view.received,
    onGetViewers: view.get,
    onPostChatMessage: (user, message) => {
      view.received(user['display-name']);
      gd.receiveMessage(user, message);
      sw.receiveMessage(user, message);
      ppg.receiveMessage(user, message);
      comm.receiveMessage(user, message);
      succ.receiveMessage(user, message);
      count.receiveMessage(user);
    },
  };

  const checkSecret = (req, res, next) => {
    next();
    // if (req.body.secret === config.secret || req.param('secret') === config.secret) {
    //   next();
    // } else {
    //   logger.info('wrong secret no access');
    //   res.sendStatus(403);
    // }
  };

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
    res.sendStatus(200);
  });

  app.post(`${config.root_server_path}/check_secret`, checkSecret, (req, res) => {
    res.sendStatus(200);
  });

  app.post(`${config.root_server_path}/test`, checkSecret, (req, res) => {
    logger.info('received /test POST');
    onRequest.onPostTest((error) => {
      handleError(error, res, () => {
        res.sendStatus(200);
      });
    });
  });

  app.post(`${config.root_server_path}/achievement`, checkSecret, (req, res) => {
    logger.info(`received /achievement POST for ${req.body.achievement} ${req.body.user.username}`);
    const achievementObj = {
      achievement: req.body.achievement,
      user: {
        username: req.body.user.username,
        'display-name': req.body.user['display-name'],
      },
    };
    onRequest.onPostAchievement(achievementObj, (error) => {
      handleError(error, res, () => {
        res.sendStatus(200);
      });
    });
  });

  app.get(`${config.root_server_path}/achievements/:username`, checkSecret, (req, res) => {
    logger.info(`received /achievements GET for ${req.params.username}`);
    onRequest.onGetAchievements(req.params.username, (error, achievements) => {
      handleError(error, res, () => {
        res.send(achievements);
      });
    });
  });

  app.get(`${config.root_server_path}/viewers`, checkSecret, (req, res) => {
    logger.info('received /viewers GET');
    const viewersList = onRequest.onGetViewers();
    res.send(viewersList);
  });

  app.post(`${config.root_server_path}/chat_message`, checkSecret, (req, res) => {
    onRequest.onPostChatMessage(req.body.user, req.body.message);
    res.sendStatus(200);
  });

  return app;
};
