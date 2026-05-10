import { inject, injectable } from "tsyringe";
import { INotificationController } from "../interfaces/controller_interfaces/INotificationController";
import { INotificationService } from "../interfaces/service_interfaces/INotificationService";
import expressAsyncHandler from "express-async-handler";
import { IApiResponse } from "../types/common/IApiResponse";
import { HTTP_STATUS, SUCCESS_STATUS } from "../shared/constants/http_status_code";
import { SUCCESS_MESSAGES } from "../shared/constants/messages";



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
    
    
}