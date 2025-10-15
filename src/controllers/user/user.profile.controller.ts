import { inject, injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IUserController } from '../../interfaces/controller_interfaces/user/IUserController';
import { IUserService } from '../../interfaces/service_interfaces/user/IUserService';
import { USER_ROLES } from '../../shared/constants/roles';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS, SUCCESS_STATUS } from '../../shared/constants/http_status_code';
import { AppError } from '../../errors/AppError';
import { IApiResponse } from 'types/common/IApiResponse';
import { SUCCESS_MESSAGES } from '../../shared/constants/messages';

import {
    UserProfileResponseDTO,
    IUpdateEmailResponseDTO,

} from '../../types/dtos/user/response.dtos';
import { IUserProfileController } from 'interfaces/controller_interfaces/user/IUserProfileController';
@injectable()
export class UserProfileController implements IUserProfileController {
  constructor(
    @inject('IUserService')
    private _userService: IUserService,
  ) {}

  async profile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== USER_ROLES.USER) {
        throw new AppError(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, HTTP_STATUS.UNAUTHORIZED);
      }
      const doc = await this._userService.profile(req.user.id);

      const successResponse: IApiResponse<UserProfileResponseDTO> = {
        success: SUCCESS_STATUS.SUCCESS,
        message: SUCCESS_MESSAGES.OK,
        data: doc,
      };

      res.status(HTTP_STATUS.OK).json(successResponse);
    } catch (error) {
      next(error);
    }
    };

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
      
       if (!req.user || req.user.role === USER_ROLES.ADMIN) {
          throw new AppError(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, HTTP_STATUS.UNAUTHORIZED);
        }
        const updateProfileRequestPayload = req.body;

        try {
            await this._userService.updateProfile({ ...updateProfileRequestPayload, email: req.user.email });

       const successResponse: IApiResponse<UserProfileResponseDTO> = {
         success: SUCCESS_STATUS.SUCCESS,
         message: SUCCESS_MESSAGES.OK,
        };
        } catch (error) {
            next(error)
        }
        
    }

    async updateEmailRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
           const updateEmailRequestPayload = req.body;
        try {
          const updateEmaildata = await this._userService.updateEmailRequest(updateEmailRequestPayload);

         const successResponse: IApiResponse<IUpdateEmailResponseDTO> = {
            success: SUCCESS_STATUS.SUCCESS,
            message: SUCCESS_MESSAGES.OK,
            data: updateEmaildata,
            };
            res.status(HTTP_STATUS.OK).json(successResponse);
            
        } catch (error) {
            next(error)
        }
        
    };

    async updateEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
        const updateEmailpayload = req.body;
        try {
            await this._userService.updateEmail(updateEmailpayload);

        const successResponse: IApiResponse = {
            success: SUCCESS_STATUS.SUCCESS,
            message: SUCCESS_MESSAGES.EMAIL_UPDATED,
            };
            res.status(HTTP_STATUS.OK).json(successResponse);
            
        } catch (error) {
            next(error)
        }
        
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.user || req.user.role === USER_ROLES.ADMIN) {
         throw new AppError(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, HTTP_STATUS.UNAUTHORIZED);
        }
        const resetPasswordPayload = req.body;
        try {
            await this._userService.resetPassword({ ...resetPasswordPayload, email: req.user.email });
            
        const successResponse: IApiResponse = {
            success: SUCCESS_STATUS.SUCCESS,
            message: SUCCESS_MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY,
            };
        res.status(HTTP_STATUS.OK).json(successResponse);

        } catch (error) {
            next(error)
        }
    }
}