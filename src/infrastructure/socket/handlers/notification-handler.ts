import { UserRole } from '../../../types/entities/user.entity';
import { AuthenticatedSocket, SocketRooms, TypedIOServer } from '../types/socket.types';
import { INotificationRepository } from '../../../interfaces/repository_interfaces/INotificationRepository';
import logger from '../../../config/logger';
import { notificationEmitter } from '../namespaces/notification-emitter';
import { NOTIFICATION_EVENTS } from '../types/socket.event';
import { IUserRepository } from '../../../interfaces/repository_interfaces/IUserRepository';

export function registerNotificationHandlers(
  io: TypedIOServer,
  socket: AuthenticatedSocket,
  notificationRepository: INotificationRepository,
  userRepository: IUserRepository,
): void {
  const { userId, role } = socket.data;

  // ── 1. Join rooms

  const privateRoom = SocketRooms.forUser(userId);
  const roleRoom = SocketRooms.forRole(role as UserRole);

  socket.join(privateRoom);
  socket.join(roleRoom);

  logger.info(
    `[Socket] Connected: userId=${userId} role=${role} | ` +
      `rooms: [${privateRoom}, ${roleRoom}, | ` +
      `socketId=${socket.id}`,
  );

  // Send current unread count on connect(when connection establishes)

  notificationRepository
    .getUnreadCount({ recipientId: userId, recipientRole: role as UserRole })
    .then((count) => {
      socket.emit(NOTIFICATION_EVENTS.UNREAD_COUNT, { count });
    })
    .catch((err) => {
      console.error(`[Socket] Failed to fetch unread count for ${userId}:`, err);
    });

  socket.on(NOTIFICATION_EVENTS.MARK_READ, ({ notificationId }) => {
    notificationEmitter.sendReadSync(userId, notificationId);
  });

  //Unread
  userRepository
    .getUserUnreadTabs(userId)
    .then((tabs) => {
      socket.emit(NOTIFICATION_EVENTS.TAB_READ, { tabs });
    })
    .catch((err) => {
      logger.error(`[Socket] tab_read error for ${userId}:`, err);
    });

  // Client event: request fresh unread count
  socket.on(NOTIFICATION_EVENTS.REQUEST_COUNT, async () => {
    try {
      const count = await notificationRepository.getUnreadCount({
        recipientId: userId,
        recipientRole: role as UserRole,
      });
      socket.emit(NOTIFICATION_EVENTS.UNREAD_COUNT, { count });
    } catch (err) {
      console.error(`[Socket] request_count error for ${userId}:`, err);
    }
  });

  // Disconnect cleanup

  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Disconnected: userId=${userId} socketId=${socket.id} reason=${reason}`);
  });

  //. Handle unexpected errors on this socket

  socket.on('error', (err) => {
    console.error(`[Socket] Socket error for userId=${userId}:`, err.message);
  });
}
