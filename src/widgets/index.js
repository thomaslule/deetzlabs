const express = require('express');
const { Router } = require('express');

module.exports = (options) => {
  const router = Router();
  router.get('/config.js', (req, res, next) => {
    try {
      const publicConfig = {
        channel: options.channel,
        client_id: options.client_id,
      };
      res.type('application/javascript');
      res.send(`window.config = ${JSON.stringify(publicConfig)}`);
    } catch (err) {
      next(err);
    }
  });
  if (options.widgets_folder) {
    router.use(express.static(options.widgets_folder));
  }
  router.use(express.static(`${__dirname}/public`));

  return router;
};
