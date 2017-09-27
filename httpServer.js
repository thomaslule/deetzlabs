const express = require('express');

module.exports = (onRequest) => {
  const handleError = (error, res, next) => {
    if (error) {
      console.error(error);
      res.status(500).send(`${error.name}: ${error.message}`);
    } else {
      next();
    }
  };

  const app = express();

  app.use(express.static('public'));

  app.post('/test', (req, res) => {
    onRequest.onPostTest((error) => {
      handleError(error, res, () => {
        res.sendStatus(200);
      });
    });
  });

  app.post('/achievement', (req, res) => {
    const achievement = {
      achievement: req.body.achievement,
      user: req.body.user,
    };
    onRequest.onPostAchievement(achievement, (error) => {
      handleError(error, res, () => {
        res.sendStatus(200);
      });
    });
  });

  app.get('/achievements/:username', (req, res) => {
    onRequest.onGetAchievements((error, achievements) => {
      handleError(error, res, () => {
        res.send(achievements);
      });
    });
  });

  return app;
};
