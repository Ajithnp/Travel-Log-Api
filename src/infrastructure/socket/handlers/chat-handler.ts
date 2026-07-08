import { AuthenticatedSocket, SocketRooms, TypedIOServer } from '../types/socket.types';
import { CHAT_EVENTS, CONNECTION_EVENTS } from '../types/socket.event';
import { IChatRepository } from '../../../interfaces/repository_interfaces/IChatRepository';
import logger from '../../../config/logger';
import { container } from 'tsyringe';
import { IChatService } from '../../../interfaces/service_interfaces/IChatService';
import { USER_ROLES } from '../../../shared/constants/roles';

export function registerChatHandlers(
  io: TypedIOServer,
  socket: AuthenticatedSocket,
  chatRepository: IChatRepository,
): void {
  const { userId, role } = socket.data;

  logger.info(`[Chat Socket] Registered handlers: userId=${userId} role=${role}`);

  // ── Client joins a specific chat room

  socket.on(CHAT_EVENTS.JOIN_ROOM, async ({ chatId }: { chatId: string }) => {
    try {
      // Guard
      const isAllowed = await chatRepository.canAccessRoom(chatId, userId, role);

      if (!isAllowed) {
        logger.warn(`[Chat Socket] Unauthorized join attempt: userId=${userId} chatId=${chatId}`);
        socket.emit(CHAT_EVENTS.CHAT_ERROR, { message: 'Access denied to this chat room' });
        return;
      }

      const room = SocketRooms.forChat(chatId);
      await socket.join(room);

      logger.info(`[Chat Socket] userId=${userId} joined room=${room}`);
    } catch (err) {
      logger.error(`[Chat Socket] join_room error for userId=${userId}:`, err);
    }
  });

  socket.on(
    CHAT_EVENTS.SEND_NEW_VENDOR_MESSAGE,
    async ({ chatId, content }: { chatId: string; content: string }) => {
      try {
        const chatService = container.resolve<IChatService>('IChatService');
        const senderId = socket.data.userId;
        const senderName = socket.data.userName || USER_ROLES.VENDOR;

        if (!senderId) {
          logger.warn(`[Chat Socket] Unauthorized send message attempt: chatId=${chatId}`);
          socket.emit(CHAT_EVENTS.CHAT_ERROR, { message: 'Unauthorized' });
          return;
        }
        await chatService.sendVendorMessage(chatId, senderId, senderName, content);
      } catch (err) {
        socket.emit(CHAT_EVENTS.CHAT_ERROR, { message: 'Failed to send message' });
        logger.error(`[Chat Socket] send_new_vendor_message error for userId=${userId}:`, err);
      }
    },
  );

  socket.on(
    CHAT_EVENTS.SEND_NEW_USER_MESSAGE,
    async ({ chatId, content }: { chatId: string; content: string }) => {
      try {
        const chatService = container.resolve<IChatService>('IChatService');
        const senderId = socket.data.userId;
        const senderName = socket.data.userName;

        if (!senderId) {
          logger.warn(`[Chat Socket] Unauthorized send message attempt: chatId=${chatId}`);
          socket.emit(CHAT_EVENTS.CHAT_ERROR, { message: 'Unauthorized' });
          return;
        }
        await chatService.sendUserMessage(chatId, senderId, senderName, content);
      } catch (err) {
        socket.emit(CHAT_EVENTS.CHAT_ERROR, { message: 'Failed to send message' });
        logger.error(`[Chat Socket] send_new_vendor_message error for userId=${userId}:`, err);
      }
    },
  );

  socket.on(CHAT_EVENTS.LEAVE_ROOM, async ({ chatId }: { chatId: string }) => {
    const room = SocketRooms.forChat(chatId);
    await socket.leave(room);
    logger.info(`[Chat Socket] userId=${userId} left room=${room}`);
  });

  socket.on(CONNECTION_EVENTS.DISCONNECT, (reason) => {
    logger.info(
      `[Chat Socket] Disconnected: userId=${userId} socketId=${socket.id} reason=${reason}`,
    );
  });

  socket.on(CONNECTION_EVENTS.ERROR, (err) => {
    logger.error(`[Chat Socket] Socket error for userId=${userId}:`, err.message);
  });
}
