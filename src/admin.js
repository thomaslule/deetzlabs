const { Router } = require('express');
const express = require('express');

module.exports = () => {
  const router = Router();
  router.get('/package.json', (req, res) => { res.sendStatus(404); });
  router.use(express.static('./node_modules/deetzlabs-web'));

  return router;
};
