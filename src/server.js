const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { log } = require('./logger');

module.exports = (viewerRoutes, settingsRoutes) => {
  const server = express();
  server.use(bodyParser.json());
  const s = { write: message => log.info(message.slice(0, -1)) };
  server.use(morgan(':remote-addr ":method :url" - :status - :response-time ms', { stream: s }));

  server.use('', viewerRoutes);
  server.use('', settingsRoutes);

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
