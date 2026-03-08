import 'reflect-metadata';
import { createServer } from 'http';
import App from './app';
import { ConnectDB } from './config/db';
import { SocketServer } from './infrastructure/socket/socket.server';
import './config/redis.config';
import logger from './config/logger';

const application = new App();
const dbConnection = new ConnectDB();

(async () => {
  try {
    await dbConnection.connect();

    //ONE shared HTTP server
    const httpServer = createServer(application.expressApp);
    
     // Attach Socket.IO to the same HTTP server
    // This must happen before httpServer.listen()
    SocketServer.getInstance(httpServer);

    // both Express and Socket.IO are now on this server
    httpServer.listen(application.port, () => {
      logger.info(`HTTP + WebSocket server running on port ${application.port}`);
      logger.info(`WebSocket namespaces ready: /notifications, /chat`);
    });
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
})();
