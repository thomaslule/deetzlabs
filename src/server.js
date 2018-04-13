const express = require('express');
const { Router } = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('config');
const { log } = require('./logger');

module.exports = (apiRouter, widgetsRouter, twitchRouter) => {
  const router = Router();
  router.use('/api', apiRouter);
  router.use('/widgets', widgetsRouter);
  router.use('/twitch', twitchRouter);

  const server = express();
  server.use(bodyParser.json());
  const s = { write: message => log.info(message.slice(0, -1)) };
  server.use(morgan(':remote-addr ":method :url" - :status - :response-time ms', { stream: s }));
  server.use(config.get('base_path'), router);
  server.use((err, req, res, next) => {
    log.error(err);
    if (err.message.startsWith('bad_request')) {
      res.status(400).send({ error: err.message });
    } else {
      res.sendStatus(500);
    }
    next();
  });

  return server;
};
