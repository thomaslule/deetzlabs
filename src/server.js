const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('config');
const { log } = require('./logger');

const stream = { write: message => log.info(message.slice(0, -1)) };

module.exports = (api, widgets) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(morgan(':remote-addr ":method :url" - :status - :response-time ms', { stream }));

  app.use(`${config.get('base_path')}/api`, api);
  app.use(`${config.get('base_path')}/widgets`, widgets);

  app.use((err, req, res, next) => {
    log.error(err);
    if (err.message.startsWith('bad_request')) {
      res.status(400).send({ error: err.message });
    } else {
      res.sendStatus(500);
    }
    next();
  });

  return http.Server(app);
};
