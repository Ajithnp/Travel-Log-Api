import { Socket, Server } from "socket.io";
import { UserRole } from "../../../types/entities/user.entity";
import { NotificationType } from "../../../types/entities/notification.entity";
import { createBroadcastNotification } from "../../../interfaces/service_interfaces/INotificationService";


// ─── Authenticated Socket 
export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    role: UserRole;
  };
}

// ─── Socket Rooms 

//   user:<userId>          → private room for one specific user/vendor/admin
//   role:User              → broadcast room for ALL users
//   role:Vendor            → broadcast room for ALL vendors


export const SocketRooms = {
  forUser: (userId: string): string => `user:${userId}`,
 
  forRole: (role: UserRole): string => `role:${role}`,
} as const;


// ─── Server → Client Events 
// What the SERVER emits TO the client.

export interface ServerToClientEvents {

  "notification_new": (payload: NotificationPayload | createBroadcastNotification) => void;
 
  "notification_read": (payload: { notificationId: string }) => void;

  "notification_read_all": () => void;
 
  "notification_unread_count": (payload: { count: number }) => void;
 
  /** Generic error from server */
  "error": (payload: { message: string }) => void;
};


// ─── Client → Server Events

// What the CLIENT emits TO the server.
 
export interface ClientToServerEvents {
 
  "notification_mark_read": (payload: { notificationId: string }) => void;
 
  "notification_request_count": () => void;
}


// ─── Socket Data
export interface SocketData {
  userId: string;
  role: UserRole;
};

// ─── Notification Payload (what the client receives)
 
export interface NotificationPayload {
  _id: string;
  recipientId: string;
  recipientRole: UserRole;
  notificationType: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  redirectUrl: string | null;
  isRead: boolean;
  createdAt: Date;
}

// ─── Emit Target
// Used by NotificationEmitter to describe who to send to.

export type EmitTarget =
  | { type: "user";    userId: string }          // one specific person
  | { type: "role";    role: UserRole }           // everyone in a role

// ─── Typed IO Server 

export type TypedIOServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData
>;
