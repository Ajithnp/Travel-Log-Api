import { Request, Response, NextFunction, RequestHandler } from 'express';
import { HTTP_STATUS, SUCCESS_STATUS } from '../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../shared/constants/messages';

export const authorize = (allowedRoles: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: SUCCESS_STATUS.FAILURE,
        message: ERROR_MESSAGES.AUTH_NO_TOKEN_PROVIDED,
      });
      return;
    }
    const { role } = req.user;

    if (allowedRoles.includes(role)) {
      next();
    } else {
      const errorMessage = {
        success: SUCCESS_STATUS.FAILURE,
        message: ERROR_MESSAGES.ACCESS_DENIED,
      };
      res.status(HTTP_STATUS.FORBIDDEN).json(errorMessage);
    }
  };
};
