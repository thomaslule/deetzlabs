const { validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.mapped() });
    return;
  }
  req.validParams = matchedData(req);
  next();
};

const isCommand = (command, message) =>
  message.trim().toLowerCase() === command ||
  message.trim().toLowerCase().startsWith(`${command} `);

module.exports = { validationMiddleware, isCommand };
