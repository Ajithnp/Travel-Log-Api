import { inject, injectable } from "tsyringe";
import { INotificationController } from "../interfaces/controller_interfaces/INotificationController";
import { INotificationService } from "../interfaces/service_interfaces/INotificationService";
import expressAsyncHandler from "express-async-handler";
import { IApiResponse } from "../types/common/IApiResponse";
import { HTTP_STATUS, SUCCESS_STATUS } from "../shared/constants/http_status_code";
import { SUCCESS_MESSAGES } from "../shared/constants/messages";
import { UserRole } from "../types/entities/user.entity";
import { getPaginationOptions } from "../shared/utils/pagination.helper";
import { GetNotificationsQuery } from "../interfaces/repository_interfaces/INotificationRepository";
import { NotificationType } from "../types/entities/notification.entity";



@injectable()
export class NotificationController implements INotificationController {
    
    constructor(
    @inject("INotificationService")
    private _notificationService: INotificationService,
    ){}

     createNotification = expressAsyncHandler(async (req, res) => {
       const result = await this._notificationService.createNotification(req.body);
   
       const successResponse: IApiResponse<typeof result> = {
         success: SUCCESS_STATUS.SUCCESS,
         message: SUCCESS_MESSAGES.OK,
         data: result,
       };
       res.status(HTTP_STATUS.CREATED).json(successResponse);
     });

     getUserNotifications = expressAsyncHandler(async (req, res) => {

        const {page, limit, selectedFilter} = getPaginationOptions(req);


        const query: GetNotificationsQuery = {
            recipientId: req.user?.id as string,
            recipientRole: req.user?.role as UserRole,
            page,
            limit,
            ...(selectedFilter && {
                    notificationType: selectedFilter as NotificationType
            }),
        };

       const result = await this._notificationService.getUserNotifications(query);
   
       const successResponse: IApiResponse<typeof result> = {
         success: SUCCESS_STATUS.SUCCESS,
         message: SUCCESS_MESSAGES.OK,
         data: result,
       };
       res.status(HTTP_STATUS.OK).json(successResponse);
     });

    getUnreadCount = expressAsyncHandler(async (req, res) => {

       const result = await this._notificationService.getUnreadCount({recipientId: req.user?.id as string, recipientRole: req.user?.role as UserRole});
   
       const successResponse: IApiResponse<typeof result> = {
         success: SUCCESS_STATUS.SUCCESS,
         message: SUCCESS_MESSAGES.OK,
         data: result,
       };
       res.status(HTTP_STATUS.OK).json(successResponse);
     });

    markAllRead = expressAsyncHandler(async (req, res) => {

       const result = await this._notificationService.markAllRead({recipientId: req.user?.id as string, recipientRole: req.user?.role as UserRole});
   
       const successResponse: IApiResponse<typeof result> = {
         success: SUCCESS_STATUS.SUCCESS,
         message: SUCCESS_MESSAGES.OK,
         data: result,
       };
       res.status(HTTP_STATUS.OK).json(successResponse);
     });

     markAsRead = expressAsyncHandler(async (req, res) => {

       const result = await this._notificationService.markAsRead(req.params.notificationId, req.user?.id as string, req.user?.role as UserRole);
   
       const successResponse: IApiResponse<typeof result> = {
         success: SUCCESS_STATUS.SUCCESS,
         message: SUCCESS_MESSAGES.OK,
         data: result,
       };
       res.status(HTTP_STATUS.OK).json(successResponse);
     });

     deleteNotification = expressAsyncHandler(async (req, res) => {

       await this._notificationService.deleteNotification(req.params.notificationId, req.user?.id as string, req.user?.role as UserRole);
   
       const successResponse: IApiResponse = {
         success: SUCCESS_STATUS.SUCCESS,
         message: SUCCESS_MESSAGES.OK,
       };

       res.status(HTTP_STATUS.OK).json(successResponse);
     });
}