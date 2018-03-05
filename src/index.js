const { log } = require('./logger');
const config = require('config');
const App = require('./app');

const start = () => {
  try {
    const app = App();

    app.listen(config.get('port'), 'localhost', () => {
      log.info(`listening on ${config.get('port')}`);
    });
  } catch (err) {
    console.error(err);
    log.error(err);
    process.exit(1);
  }
};

start();
