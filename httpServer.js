const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./logger');
const config = require('./config');
const testAchievement = require('./testAchievement');

module.exports = (deetzlabs) => {
  const {
    achievement, viewers, gravedigger, swedish, pompomgirl, commands, succes, countMessages,
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
    res.sendStatus(200);
  });

  app.post(`${config.root_server_path}/test`, (req, res) => {
    logger.info('received /test POST');
    testAchievement((error) => {
      handleError(error, res, () => {
        res.sendStatus(200);
      });
    });
  });

  app.post(`${config.root_server_path}/achievement`, (req, res) => {
    logger.info(`received /achievement POST for ${req.body.achievement} ${req.body.user.username}`);
    const achievementObj = {
      achievement: req.body.achievement,
      user: {
        username: req.body.user.username,
        'display-name': req.body.user['display-name'],
      },
    };
    achievement.received(achievementObj, (error) => {
      handleError(error, res, () => {
        res.sendStatus(200);
      });
    });
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
      gravedigger,
      swedish,
      pompomgirl,
      commands,
      succes,
      countMessages,
    ].forEach(obj => obj.receiveMessage(user, message));
    res.sendStatus(200);
  });

  return app;
};
