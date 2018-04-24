const { Router } = require('express');
const express = require('express');
const path = require('path');

module.exports = () => {
  const router = Router();
  router.get('/package.json', (req, res) => { res.sendStatus(404); });
  router.use(express.static(path.resolve(require.resolve('deetzlabs-web'), '..')));

  return router;
};
