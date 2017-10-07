const winston = require('winston');

const tsFormat = () => (new Date()).toLocaleString();

module.exports = new (winston.Logger)({
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
