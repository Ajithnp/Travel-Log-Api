import { RequestHandler } from "express";

export interface INotificationController {
    createNotification: RequestHandler;
}