import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { container } from 'tsyringe';
import { config } from '../../config/env';
import logger from '../../config/logger';
import { REPOSITORY_TOKENS } from '../../shared/constants/di.tokens';
import { INotificationRepository } from '../../interfaces/repository_interfaces/INotificationRepository';
import { socketAuthMiddleware } from './socket.middleware';
import { AuthenticatedSocket, TypedIOServer } from './types/socket.types';
import { registerNotificationHandlers } from './handlers/notification-handler';
import { notificationEmitter } from './namespaces/notification-emitter';
import { IChatRepository } from '../../interfaces/repository_interfaces/IChatRepository';
import { registerChatHandlers } from './handlers/chat-handler';
import { chatEmitter } from './namespaces/chat-emitter';
import { IUserRepository } from '../../interfaces/repository_interfaces/IUserRepository';

export function initSocketServer(httpServer: HttpServer): TypedIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.cors.ALLOWED_ORIGINS,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 5000,
    maxHttpBufferSize: 1e6,
    transports: ['websocket', 'polling'],
  });

  io.use((socket, next) => {
    socketAuthMiddleware(socket as AuthenticatedSocket, next);
  });

  const notificationRepository = container.resolve<INotificationRepository>(
    REPOSITORY_TOKENS.NOTIFICATION_REPOSITORY,
  );
  const userRepository = container.resolve<IUserRepository>(REPOSITORY_TOKENS.USER_REPOSITORY);

  const chatRepository = container.resolve<IChatRepository>(REPOSITORY_TOKENS.CHAT_REPOSITORY);

  // ── Connection handler(fires every time a new user connects)
  io.on('connection', (socket) => {
    registerNotificationHandlers(
      io,
      socket as AuthenticatedSocket,
      notificationRepository,
      userRepository,
    );
    registerChatHandlers(io, socket as AuthenticatedSocket, chatRepository);
  });

  // ANY service can call:
  // notificationEmitter.send(target, payload)

  notificationEmitter.init(io);
  chatEmitter.init(io);

  logger.info(
    `[Socket.IO] Server initialized | Origins: ${
      Array.isArray(config.cors.ALLOWED_ORIGINS)
        ? config.cors.ALLOWED_ORIGINS.join(', ')
        : config.cors.ALLOWED_ORIGINS
    }`,
  );

  return io;
}
