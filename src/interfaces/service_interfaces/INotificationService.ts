import { GetNotificationsQuery } from "interfaces/repository_interfaces/INotificationRepository";
import { Types } from "mongoose";
import { NotificationType } from "types/entities/notification.entity";
import { UserRole } from "types/entities/user.entity";

export interface INotificationService {
    createNotification(payload: CreateNotificationDTO): Promise<NotificationResponseDTO>;
    getUserNotifications(query: GetNotificationsQuery): Promise<PaginatedNotificationsDTO>;
    getUnreadCount(payload:{recipientId:string,recipientRole:UserRole}): Promise<{ unreadCount: number }>;
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
 

 
 
// ─── Response shapes ─────────
 
export interface NotificationResponseDTO {
  _id: string;
  recipientId: string;
  recipientRole: UserRole;
  senderId: string | null;
  notificationType: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
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
}
 
// ─── Mark Read ────
 
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