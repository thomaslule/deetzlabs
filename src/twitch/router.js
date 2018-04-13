const { Router } = require('express');
const xhub = require('express-x-hub');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const config = require('config');
const logger = require('../logger');

module.exports = (bus) => {
  const router = Router();
  router.use(xhub({ algorithm: 'sha256', secret: config.get('secret') }));
  router.use(bodyParser.json());
  const s = { write: message => logger.info(message.slice(0, -1)) };
  router.use(morgan(':remote-addr ":method :url" - :status - :response-time ms', { stream: s }));

  router.get('/twitch-webhook', (req, res, next) => {
    try {
      res.send(req.query['hub.challenge']);
    } catch (err) {
      next(err);
    }
  });

  router.post('/twitch-webhook', (req, res, next) => {
    try {
      if (req.isXHub && req.isXHubValid()) {
        req.body.data.forEach((d) => { bus.emit('webhook-follow', d.from_id); });
        res.sendStatus(200);
      } else {
        logger.error('Received a webhook notification with invalid X-Hub-Signature');
        res.sendStatus(400);
      }
    } catch (err) {
      next(err);
    }
  });

  router.use((err, req, res, next) => {
    logger.error(err);
    res.sendStatus(500);
    next();
  });

  return router;
};
