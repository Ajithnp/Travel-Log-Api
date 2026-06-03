import { inject, injectable } from 'tsyringe';
import {
  CreateNotificationDTO,
  INotificationService,
  NotificationResponseDTO,
  PaginatedNotificationsDTO,
} from '../interfaces/service_interfaces/INotificationService';
import {
  GetNotificationsQuery,
  INotificationRepository,
} from '../interfaces/repository_interfaces/INotificationRepository';
import { toObjectId } from '../shared/utils/database/objectId.helper';
import { NotificationMapper } from '../shared/mappers/notification.mapper';
import { UserRole } from '../types/entities/user.entity';

import { EmitTarget } from '../infrastructure/socket/types/socket.types';
import { notificationEmitter } from '../infrastructure/socket/namespaces/notification-emitter';
import logger from '../config/logger';
import { VendorTabs } from '../shared/constants/constants';
import { HTTP_STATUS } from '../shared/constants/http_status_code';
import { AppError } from '../errors/AppError';
import { ERROR_MESSAGES } from '../shared/constants/messages';
import { IUserRepository } from '../interfaces/repository_interfaces/IUserRepository';

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject('INotificationRepository')
    private _notificationRepo: INotificationRepository,
    @inject('IUserRepository')
    private _userRepository: IUserRepository,
  ) {}

  async createNotification(payload: CreateNotificationDTO): Promise<NotificationResponseDTO> {
    const notification = await this._notificationRepo.create({
      recipientId: toObjectId(payload.recipientId as string),
      recipientRole: payload.recipientRole,
      senderId: payload.senderId ? toObjectId(payload.senderId as string) : undefined,
      notificationType: payload.notificationType,
      title: payload.title,
      message: payload.message,
      data: payload.data,
      redirectUrl: payload.redirectUrl,
    });

    const response = NotificationMapper.toNotification(notification);

    const target: EmitTarget = payload.recipientId
      ? { type: 'user', userId: payload.recipientId.toString() }
      : { type: 'role', role: payload.recipientRole };

    // . Emit via socket (fire-and-forget, never throws)

    try {
      notificationEmitter.send(target, {
        _id: response._id,
        recipientId: response.recipientId,
        recipientRole: response.recipientRole,
        notificationType: response.notificationType,
        title: response.title,
        message: response.message,
        data: response.data,
        redirectUrl: response.redirectUrl,
        isRead: response.isRead,
        createdAt: response.createdAt,
      });
    } catch (err) {
      logger.error('[NotificationService] Socket emit failed (non-fatal):', err);
    }

    return response;
  }

  async getUserNotifications(query: GetNotificationsQuery): Promise<PaginatedNotificationsDTO> {
    const { notifications, total, unreadCount } =
      await this._notificationRepo.findAllNotificationsByUserId({ ...query });

    const totalPages = Math.ceil(total / query.limit);
    return {
      notifications: notifications.map(NotificationMapper.toNotification),
      total,
      unreadCount,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }

  async getUnreadCount(payload: {
    recipientId: string;
    recipientRole: UserRole;
  }): Promise<{ unreadCount: number }> {
    const count = await this._notificationRepo.getUnreadCount(payload);
    return { unreadCount: count };
  }

  async markAllRead(payload: {
    recipientId: string;
    recipientRole: UserRole;
  }): Promise<{ modifiedCount: number }> {
    const count = await this._notificationRepo.markAllRead(payload);

    notificationEmitter.sendReadAllSync(payload.recipientId);
    notificationEmitter.sendUnreadCount(payload.recipientId, 0);

    return { modifiedCount: count };
  }

  async markAsRead(
    notificationId: string,
    recipientId: string,
    recipientRole: UserRole,
  ): Promise<{ modifiedCount: number }> {
    const result = await this._notificationRepo.markAsRead(
      notificationId,
      recipientId,
      recipientRole,
    );

    notificationEmitter.sendReadSync(recipientId, notificationId);

    const count = await this._notificationRepo.getUnreadCount({ recipientId, recipientRole });

    notificationEmitter.sendUnreadCount(recipientId, count);

    return { modifiedCount: result.modifiedCount };
  }

  async deleteNotification(
    notificationId: string,
    recipientId: string,
    recipientRole: UserRole,
  ): Promise<void> {
    notificationEmitter.sendReadSync(recipientId, notificationId);
    await this._notificationRepo.findOneAndDelete({
      _id: toObjectId(notificationId),
      recipientId: toObjectId(recipientId),
      recipientRole: recipientRole,
    });

    notificationEmitter.sendUnreadCount(recipientId, 1);
  }

  async markTabsAsRead(userId: string, tab: VendorTabs): Promise<void> {
    const userDoc = await this._userRepository.findById(userId);
    if (!userDoc) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    await this._userRepository.findByIdAndRemoveUnreadTabs(userId, tab);
  }
}
