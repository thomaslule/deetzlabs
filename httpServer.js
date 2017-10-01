const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./logger');
const config = require('./config');

module.exports = (onRequest) => {
  const checkSecret = (req, res, next) => {
    if (req.body.secret === config.secret || req.param('secret') === config.secret) {
      next();
    } else {
      logger.info('wrong secret no access');
      res.sendStatus(403);
    }
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
    const achievement = {
      achievement: req.body.achievement,
      user: {
        username: req.body.user.username,
        'display-name': req.body.user['display-name'],
      },
    };
    onRequest.onPostAchievement(achievement, (error) => {
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

  app.post(`${config.root_server_path}/viewer`, checkSecret, (req, res) => {
    logger.info(`receieved /viewer POST for ${req.body.name}`);
    onRequest.onPostViewer(req.body.name, (error) => {
      handleError(error, res, () => {
        res.sendStatus(200);
      });
    });
  });

  app.get(`${config.root_server_path}/viewers`, checkSecret, (req, res) => {
    logger.info('received /viewers GET');
    const viewers = onRequest.onGetViewers();
    res.send(viewers);
  });

  return app;
};
