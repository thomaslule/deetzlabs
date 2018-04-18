const express = require('express');
const { Router } = require('express');
const config = require('config');

module.exports = () => {
  const router = Router();
  router.get('/config.js', (req, res, next) => {
    try {
      const publicConfig = {
        channel: config.get('channel'),
        client_id: config.get('client_id'),
      };
      res.type('application/javascript');
      res.send(`window.config = ${JSON.stringify(publicConfig)}`);
    } catch (err) {
      next(err);
    }
  });
  router.use(express.static('src/widgets/public'));

  return router;
};
