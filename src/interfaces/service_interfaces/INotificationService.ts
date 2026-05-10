import { Types } from "mongoose";
import { NotificationType } from "types/entities/notification.entity";
import { UserRole } from "types/entities/user.entity";

export interface INotificationService {
    createNotification(payload: CreateNotificationDTO): Promise<NotificationResponseDTO>;
}

export interface CreateNotificationDTO {
  recipientId: string | Types.ObjectId;
  recipientRole: UserRole;
  senderId?: string | Types.ObjectId | null;
  notificationType: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  redirectUrl?: string | null;
}
 
// ─── Query / Filtering ────────────────────────────────────────────────────────
 
export interface GetNotificationsQueryDTO {
  recipientId: string;
  recipientRole: UserRole;
  notificationType?: NotificationType;   // optional filter by type
  isRead?: boolean;                      // optional filter: true | false
  page?: number;                         // default 1
  limit?: number;                        // default 20, max 100
}
 
// ─── Response shapes ──────────────────────────────────────────────────────────
 
export interface NotificationResponseDTO {
  _id: string;
  recipientId: string;
  recipientRole: UserRole;
  senderId: string | null;
  notificationType: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  redirectUrl: string | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
 
export interface PaginatedNotificationsDTO {
  notifications: NotificationResponseDTO[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
 
// ─── Mark Read ────────────────────────────────────────────────────────────────
 
export interface MarkReadDTO {
  notificationId: string;
  recipientId: string;   // ownership check — only owner can mark their own notification
}
 
export interface MarkAllReadDTO {
  recipientId: string;
  recipientRole: UserRole;
}
 
// ─── Delete ───────────────────────────────────────────────────────────────────
 
export interface DeleteNotificationDTO {
  notificationId: string;
  recipientId: string;   // ownership check
}