const config = require('config');
const winston = require('winston');
require('winston-mongodb');

winston.remove(winston.transports.Console);
let logger = winston;

const log = {
  debug: (...args) => logger.debug(...args),
  verbose: (...args) => logger.verbose(...args),
  info: (...args) => logger.info(...args),
  warn: (...args) => logger.warn(...args),
  error: (...args) => logger.error(...args),
};

const configureLogger = (db) => {
  const tsFormat = () => (new Date()).toLocaleString();

  logger = new (winston.Logger)();

  if (config.get('log_to_console')) {
    logger.add(winston.transports.Console, {
      timestamp: tsFormat,
    });
  }

  if (config.get('log_to_file')) {
    logger.add(winston.transports.File, {
      json: false,
      timestamp: tsFormat,
      filename: 'deetzlabs.log',
    });
  }

  if (config.get('log_to_db')) {
    logger.add(winston.transports.MongoDB, {
      db,
    });
  }
};

module.exports = { configureLogger, log };
