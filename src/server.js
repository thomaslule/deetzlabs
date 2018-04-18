const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { log } = require('./logger');

const stream = { write: message => log.info(message.slice(0, -1)) };

module.exports = (api, widgets, admin) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(morgan(':remote-addr ":method :url" - :status - :response-time ms', { stream }));

  app.use('/api', api);
  app.use('/widgets', widgets);
  app.use('/admin', admin);
  app.get('/', (req, res) => { res.redirect('/admin'); });

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
