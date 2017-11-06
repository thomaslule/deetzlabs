const winston = require('winston');
const config = require('config');

const tsFormat = () => (new Date()).toLocaleString();

const transports = [];

if (config.get('log_to_console')) {
  transports.push(new (winston.transports.Console)({
    timestamp: tsFormat,
  }));
}

if (config.get('log_to_file')) {
  transports.push(new (winston.transports.File)({
    timestamp: tsFormat,
    filename: 'deetzlabs.log',
  }));
}

module.exports = new (winston.Logger)({
  transports,
});
