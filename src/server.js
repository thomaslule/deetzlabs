const http = require('http');
const express = require('express');
const { Router } = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('config');
const socketio = require('socket.io');
const { log } = require('./logger');

const stream = { write: message => log.info(message.slice(0, -1)) };

module.exports = () => {
  const router = Router();

  const app = express();
  app.use(bodyParser.json());
  app.use(morgan(':remote-addr ":method :url" - :status - :response-time ms', { stream }));
  app.use(config.get('base_path'), router);
  app.use((err, req, res, next) => {
    log.error(err);
    if (err.message.startsWith('bad_request')) {
      res.status(400).send({ error: err.message });
    } else {
      res.sendStatus(500);
    }
    next();
  });

  const server = http.Server(app);
  const socket = socketio.listen(server, { path: `${config.get('base_path')}/socket.io` });

  const getRouter = () => router;
  const getSocket = () => socket;
  const getServer = () => server;

  return { getRouter, getSocket, getServer };
};
