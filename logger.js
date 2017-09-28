const winston = require('winston');

const tsFormat = () => (new Date()).toLocaleString();

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: tsFormat,
    }),
    new (winston.transports.File)({
      timestamp: tsFormat,
      filename: 'log.log',
    }),
  ],
});

module.exports = logger;
