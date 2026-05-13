import { createBroadcastNotification } from "interfaces/service_interfaces/INotificationService";
import logger from "../../../config/logger";
import {
  EmitTarget,
  NotificationPayload,
  SocketRooms,
  TypedIOServer,
} from "../types/socket.types";

export class NotificationEmitter {
  private static instance: NotificationEmitter;
  private io: TypedIOServer | null = null;
 
  private constructor() {}

  static getInstance(): NotificationEmitter {
    if (!NotificationEmitter.instance) {
      NotificationEmitter.instance = new NotificationEmitter();
    }
    return NotificationEmitter.instance;
  };

  init(io: TypedIOServer): void {
    this.io = io;
    logger.info("[NotificationEmitter] Initialized with Socket.IO server.");
  }


    send(target: EmitTarget, payload: NotificationPayload | createBroadcastNotification): void {
    if (!this.io) {
      // Socket not yet initialized (e.g. during unit tests or early startup)
      console.warn("[NotificationEmitter] io not initialized. Skipping emit.");
      return;
    }

    const room = this.resolveRoom(target);
    console.log("room", room);
    logger.info(
      `[NotificationEmitter] Emitting 'notification:new' → room: "${room}" | type: ${payload.notificationType}`
    );
 
    this.io.to(room).emit("notification_new", payload);
    console.log("notification_new==================")
  };

    // ── Emit unread count update to a specific user 
    sendUnreadCount(userId: string, count: number): void {
    if (!this.io) return;
    this.io
      .to(SocketRooms.forUser(userId))
      .emit("notification_unread_count", { count });
  };

   // ── Emit read sync (for multi-tab support) 
     sendReadSync(userId: string, notificationId: string): void {
    if (!this.io) return;
    this.io
      .to(SocketRooms.forUser(userId))
      .emit("notification_read", { notificationId });
  };

  // ── Emit mark-all-read sync
    sendReadAllSync(userId: string): void {
    if (!this.io) return;
    this.io
      .to(SocketRooms.forUser(userId))
      .emit("notification_read_all");
  };

    private resolveRoom(target: EmitTarget): string {
    switch (target.type) {
      case "user":
        return SocketRooms.forUser(target.userId);
      case "role":
        return SocketRooms.forRole(target.role);
 
    }
  };

    // ── Health check
 
  isReady(): boolean {
    return this.io !== null;
  };

    /**
   * Get count of sockets currently in a user's private room.
   * Useful for knowing if the user is online before deciding to
   * send a push notification fallback.
   */

      async getSocketCountForUser(userId: string): Promise<number> {
    if (!this.io) return 0;
    const sockets = await this.io
      .in(SocketRooms.forUser(userId))
      .fetchSockets();
    return sockets.length;
  }
 
  isUserOnline(userId: string): Promise<boolean> {
    return this.getSocketCountForUser(userId).then((count) => count > 0);
  };


}

export const notificationEmitter = NotificationEmitter.getInstance();