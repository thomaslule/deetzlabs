const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./logger');

module.exports = (onRequest) => {
  const handleError = (error, res, next) => {
    if (error) {
      res.status(500).send(`${error.name}: ${error.message}`);
    } else {
      next();
    }
  };

  const app = express();
  app.use(bodyParser.json());

  app.use(express.static('public'));

  app.post('/test', (req, res) => {
    logger.info('received /test POST');
    onRequest.onPostTest((error) => {
      handleError(error, res, () => {
        res.sendStatus(200);
      });
    });
  });

  app.post('/achievement', (req, res) => {
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

  app.get('/achievements/:username', (req, res) => {
    logger.info(`received /achievements GET for ${req.params.username}`);
    onRequest.onGetAchievements(req.params.username, (error, achievements) => {
      handleError(error, res, () => {
        res.send(achievements);
      });
    });
  });

  return app;
};
