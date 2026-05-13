import { UserRole } from "../../../types/entities/user.entity";
import { AuthenticatedSocket, SocketRooms, TypedIOServer } from "../types/socket.types";
import { INotificationRepository } from "../../../interfaces/repository_interfaces/INotificationRepository";
import logger from "../../../config/logger";
import { notificationEmitter } from "../namespaces/notification-emitter";
import { NOTIFICATION_EVENTS } from "../types/socket.event";

export function registerNotificationHandlers(
  io: TypedIOServer,
  socket: AuthenticatedSocket,
  notificationRepository: INotificationRepository
): void {
  const { userId, role } = socket.data;

  // ── 1. Join rooms 

  const privateRoom  = SocketRooms.forUser(userId);
  const roleRoom     = SocketRooms.forRole(role as UserRole);

  socket.join(privateRoom);
  socket.join(roleRoom);

    logger.info(
    `[Socket] Connected: userId=${userId} role=${role} | ` +
    `rooms: [${privateRoom}, ${roleRoom}, | ` +
    `socketId=${socket.id}`
  );

    // ── 2. Send current unread count on connect(when connection establishes)

    notificationRepository
    .getUnreadCount({recipientId : userId, recipientRole : (role as UserRole)})
    .then((count) => {
      socket.emit(NOTIFICATION_EVENTS.UNREAD_COUNT, { count });
    })
    .catch((err) => {
      console.error(`[Socket] Failed to fetch unread count for ${userId}:`, err);
    });


    socket.on(NOTIFICATION_EVENTS.MARK_READ,  ({ notificationId }) => {
     notificationEmitter.sendReadSync(userId, notificationId);
  });
  // ── 4. Client event: request fresh unread count 
    socket.on(NOTIFICATION_EVENTS.REQUEST_COUNT, async () => {
    try {
      const count = await notificationRepository.getUnreadCount({recipientId : userId, recipientRole : (role as UserRole)});
      socket.emit(NOTIFICATION_EVENTS.UNREAD_COUNT, { count });
    } catch (err) {
      console.error(`[Socket] request_count error for ${userId}:`, err);
    }
  });

    // ── 5. Disconnect cleanup 

    // Socket.IO automatically removes the socket from all rooms on disconnect.
    // If we use Redis presence tracking, clear it here.

  socket.on("disconnect", (reason) => {
    console.log(
      `[Socket] Disconnected: userId=${userId} socketId=${socket.id} reason=${reason}`
    );
  });

// ── 6. Handle unexpected errors on this socket

  socket.on("error", (err) => {
    console.error(`[Socket] Socket error for userId=${userId}:`, err.message);
  });

}