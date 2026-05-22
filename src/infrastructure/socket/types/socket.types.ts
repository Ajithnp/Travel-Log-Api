import { Socket, Server } from 'socket.io';
import { UserRole } from '../../../types/entities/user.entity';
import { NotificationType } from '../../../types/entities/notification.entity';
import { createBroadcastNotification } from '../../../interfaces/service_interfaces/INotificationService';

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

  forChat: (chatId: string) => `chat:${chatId}`,
} as const;

export interface ServerToClientEvents {
  notification_new: (payload: NotificationPayload | createBroadcastNotification) => void;
  notification_read: (payload: { notificationId: string }) => void;
  notification_read_all: () => void;
  notification_unread_count: (payload: { count: number }) => void;

  // ── Chat events
  'chat:message_new': (payload: ChatMessagePayload) => void;
  'chat:room_updated': (payload: ChatRoomUpdatedPayload) => void;
  'chat:error': (payload: { message: string }) => void;

  // Generic error from server
  error: (payload: { message: string }) => void;
}

export interface ClientToServerEvents {
  notification_mark_read: (payload: { notificationId: string }) => void;
  notification_request_count: () => void;
  'chat:join': (payload: { chatId: string }) => void;
  'chat:leave': (payload: { chatId: string }) => void;
}
export interface SocketData {
  userId: string;
  role: UserRole;
}

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

export interface ChatMessagePayload {
  id: string;
  chatId: string;
  senderId: string;
  senderRole: UserRole;
  senderName: string;
  content: string;
  createdAt: Date;
}

export interface ChatRoomUpdatedPayload {
  chatId: string;
  pinnedMessage?: string;
  blockedUserId?: string;
  status?: 'active' | 'archived';
}

export type EmitTarget =
  | { type: 'user'; userId: string } // one specific person
  | { type: 'role'; role: UserRole }; // everyone in a role

export type TypedIOServer = Server<ClientToServerEvents, ServerToClientEvents, SocketData>;
