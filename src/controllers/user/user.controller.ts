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
import { IUserProfileDTO } from '../../dtos/user/user.profile.response.dtos';
@injectable()
export class UserController implements IUserController {
  constructor(
    @inject('IUserService')
    private _userService: IUserService,
  ) {}

  async profile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('---', req.user,  req.user?.role);
      
      if (!req.user || req.user.role !== USER_ROLES.USER) {
        throw new AppError(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, HTTP_STATUS.UNAUTHORIZED);
      }
      const doc = await this._userService.profileService(req.user.id);

      const successResponse: IApiResponse<IUserProfileDTO> = {
        success: SUCCESS_STATUS.SUCCESS,
        message: SUCCESS_MESSAGES.OK,
        data: doc,
      };

      res.status(HTTP_STATUS.OK).json(successResponse);
    } catch (error) {
        next(error)
    }
  }
}
