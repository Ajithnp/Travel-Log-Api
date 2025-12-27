import asyncHandler from 'express-async-handler';
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
import { UserProfileResponseDTO } from '../../types/dtos/user/response.dtos';
@injectable()
export class UserController implements IUserController {
  constructor(
    @inject('IUserService')
    private _userService: IUserService,
  ) {}

}
