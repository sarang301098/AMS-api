import 'reflect-metadata';

import logger from './service/log';
import Database from './database';
import app from './app';

const database = new Database();

const port = app.get('port');

(async function () {
  try {
    await database.connect();

    app.listen(port, () => {
      logger.info(`Server started - PORT: ${port}`);
      process.send && process.send('ready');
    });
  } catch (error) {
    logger.error('Unable to connect to database. ', error);
    process.stdin.emit('SIGINT');
    process.exit(1);
  }
})();

process.on('SIGINT', async () => {
  logger.info('Gracefully shutting down');
  await database.disConnect();
  process.exit(0);
});
