const winston = require('winston');
require('winston-daily-rotate-file');

winston.remove(winston.transports.Console);
let logger = winston;

const log = {
  debug: (...args) => logger.debug(...args),
  verbose: (...args) => logger.verbose(...args),
  info: (...args) => logger.info(...args),
  warn: (...args) => logger.warn(...args),
  error: (...args) => logger.error(...args),
};

const configureLogger = (options) => {
  const tsFormat = () => (new Date()).toLocaleString();

  logger = new (winston.Logger)();

  if (options.log_to_console) {
    logger.add(winston.transports.Console, {
      timestamp: tsFormat,
    });
  }

  if (options.log_to_file) {
    logger.add(winston.transports.DailyRotateFile, {
      json: false,
      timestamp: tsFormat,
      filename: './log/deetzlabs',
      createTree: true,
    });
  }
};

module.exports = { configureLogger, log };
