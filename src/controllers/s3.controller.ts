import asyncHandler from 'express-async-handler';
import { inject, injectable } from 'tsyringe';
import { IS3Controller } from '../interfaces/controller_interfaces/IS3Controller';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../shared/constants/messages';
import { HTTP_STATUS, SUCCESS_STATUS } from '../shared/constants/http_status_code';
import { IApiResponse } from '../types/common/IApiResponse';
import { IGetUploadUrlResponse } from '../types/dtos/common/response.dtos';
import { IFileStorageHandlerService } from '../interfaces/service_interfaces/IFileStorageBusinessService';

@injectable()
export class S3Controller implements IS3Controller {
  constructor(
    @inject('IFileStorageHandlerService')
    private _s3Service: IFileStorageHandlerService,
  ) {}

  generateUploadURL = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new AppError('Use valid file types', HTTP_STATUS.BAD_REQUEST);
    }

    const uploadUrls = await this._s3Service.getUploadUrls(files);

    const successResponse: IApiResponse<IGetUploadUrlResponse[]> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: uploadUrls,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  generateDownloadURL = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId, keys } = req.query;

    if (!userId || !keys) {
      throw new AppError('Missing required parameters: userId or keys', HTTP_STATUS.BAD_REQUEST);
    }

    const keysArray = Array.isArray(keys) ? keys : [keys];

    const signedUrls = await this._s3Service.getViewUrls(String(userId), keysArray.map(String));

    const successResponse: IApiResponse<string[]> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: signedUrls,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
