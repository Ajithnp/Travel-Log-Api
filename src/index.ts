import 'reflect-metadata';
import { createServer } from 'http';
import App from './app';
import { ConnectDB } from './config/db';
import './config/redis.config';
import logger from './config/logger';
import { initSocketServer } from './infrastructure/socket/socket.server';

const application = new App();
const dbConnection = new ConnectDB();

(async () => {
  try {
    await dbConnection.connect();

    const httpServer = createServer(application.expressApp);

    initSocketServer(httpServer);

    httpServer.listen(application.port, () => {
      logger.info(`HTTP + WebSocket server running on port ${application.port}`);
    });
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
})();
