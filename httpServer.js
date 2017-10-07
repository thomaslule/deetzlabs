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
    ach.received(achievementObj, (error) => {
      handleError(error, res, () => {
        res.sendStatus(200);
      });
    });
  });

  app.get(`${config.root_server_path}/viewers`, (req, res) => {
    logger.info('received /viewers GET');
    const viewersList = view.get();
    res.send(viewersList);
  });

  app.post(`${config.root_server_path}/chat_message`, (req, res) => {
    const { user, message } = req.body;
    [view, gd, sw, ppg, comm, succ, count].forEach(obj => obj.receiveMessage(user, message));
    res.sendStatus(200);
  });

  return app;
};
