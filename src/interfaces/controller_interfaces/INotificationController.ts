import { RequestHandler } from "express";

export interface INotificationController {
    createNotification: RequestHandler;
    getUserNotifications: RequestHandler;
    getUnreadCount: RequestHandler;
}