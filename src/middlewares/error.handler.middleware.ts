import { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { HTTP_STATUS, SUCCESS_STATUS } from '../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../shared/constants/messages';
import { IApiResponse } from 'types/common/IApiResponse';
import { isMongoServerError, isSyntaxError } from '../errors/gurdes/isMongoError';
import { handleMongoDuplicateError } from '../errors/MongoError';

export const errorMiddleware = (err: Error | AppError | any, req: Request, res: Response) => {
  let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message: string = ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR;
  let errorCode: string | undefined;

  if (err instanceof AppError) {
    statusCode = err.status_code;
    message = err.message;
    errorCode = err.error_code;
  } else if (isMongoServerError(err)) {
    const { message: mongoMessage, errorCode: mongoErrorCode } = handleMongoDuplicateError(err);
    statusCode = HTTP_STATUS.CONFLICT;
    message = mongoMessage;
    errorCode = mongoErrorCode;
  } else if (isSyntaxError(err)) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = ERROR_MESSAGES.INVALID_JSON_PAYLOAD;
  } else {
    statusCode = err?.status_code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    message = err?.message ?? ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR;
    errorCode = err?.error_code;
  }

  const response: IApiResponse = {
    success: SUCCESS_STATUS.FAILURE,
    message,
    error: errorCode
      ? {
          code: errorCode,
        }
      : {
          code: 'UNKNOWN_ERROR',
        },
  };

  res.status(statusCode).json(response);
};
