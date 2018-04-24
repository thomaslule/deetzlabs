const { Router } = require('express');
const express = require('express');
const path = require('path');

const adminPath = path.resolve(require.resolve('deetzlabs-web'), '..');

module.exports = () => {
  const router = Router();
  router.get('/package.json', (req, res) => { res.sendStatus(404); });
  router.use(express.static(adminPath));
  router.get('*', (req, res) => { res.sendfile(`${adminPath}/index.html`); });

  return router;
};
