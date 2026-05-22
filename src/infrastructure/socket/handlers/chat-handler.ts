import { AuthenticatedSocket, SocketRooms, TypedIOServer } from '../types/socket.types';
import { CHAT_EVENTS } from '../types/socket.event';
import { IChatRepository } from '../../../interfaces/repository_interfaces/IChatRepository';
import logger from '../../../config/logger';

export function registerChatHandlers(
  io: TypedIOServer,
  socket: AuthenticatedSocket,
  chatRepository: IChatRepository,
): void {
  const { userId, role } = socket.data;

  logger.info(`[Chat Socket] Registered handlers: userId=${userId} role=${role}`);

  // ── Client joins a specific chat room ────────────────────────────────────────
  // Called when user/vendor opens a chat window
  // Client emits: socket.emit("chat:join", { chatId })

  socket.on(CHAT_EVENTS.JOIN_ROOM, async ({ chatId }: { chatId: string }) => {
    try {
      // Guard: verify the user is actually a member of this chat
      const isAllowed = await chatRepository.canAccessRoom(chatId, userId, role);

      if (!isAllowed) {
        logger.warn(`[Chat Socket] Unauthorized join attempt: userId=${userId} chatId=${chatId}`);
        socket.emit('chat:error', { message: 'Access denied to this chat room' });
        return;
      }

      const room = SocketRooms.forChat(chatId);
      await socket.join(room);

      logger.info(`[Chat Socket] userId=${userId} joined room=${room}`);
    } catch (err) {
      logger.error(`[Chat Socket] join_room error for userId=${userId}:`, err);
    }
  });

  socket.on(CHAT_EVENTS.LEAVE_ROOM, async ({ chatId }: { chatId: string }) => {
    const room = SocketRooms.forChat(chatId);
    await socket.leave(room);
    logger.info(`[Chat Socket] userId=${userId} left room=${room}`);
  });

  socket.on('disconnect', (reason) => {
    logger.info(
      `[Chat Socket] Disconnected: userId=${userId} socketId=${socket.id} reason=${reason}`,
    );
  });

  socket.on('error', (err) => {
    logger.error(`[Chat Socket] Socket error for userId=${userId}:`, err.message);
  });
}
