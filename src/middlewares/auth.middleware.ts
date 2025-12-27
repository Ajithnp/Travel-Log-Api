import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../shared/constants/messages';
import { container } from 'tsyringe';
import { ITokenService } from '../interfaces/service_interfaces/ITokenService';
import { IUserRepository } from '../interfaces/repository_interfaces/IUserRepository';
import { SERVICE_TOKENS } from '../shared/constants/di.tokens';
import { REPOSITORY_TOKENS } from '../shared/constants/di.tokens';
import { SUCCESS_STATUS } from '../shared/constants/http_status_code';
import { JWT_TOKEN } from '../shared/constants/jwt.token';
import { ITokenBlackListService } from 'interfaces/service_interfaces/ITokenBlacklistService';

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.[JWT_TOKEN.ACCESS_TOKEN];

  if (!token) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: SUCCESS_STATUS.FAILURE,
      message: ERROR_MESSAGES.AUTH_NO_TOKEN_PROVIDED,
    });
    return;
  }

  try {
    const tokenService = container.resolve<ITokenService>(SERVICE_TOKENS.TOKEN_SERVICE);
    const decode = tokenService.verifyAccessToken(token as string);
    
    if (!decode) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: SUCCESS_STATUS.FAILURE,
        message: ERROR_MESSAGES.AUTH_INVALID_TOKEN,
      });
      return;
    }

    // checking blacklist
    const tokenBlackListService = container.resolve<ITokenBlackListService>(
      SERVICE_TOKENS.TOKEN_BLACKLIST,
    );

    const isBlackListed = await tokenBlackListService.isBlackListed(token);

    if (isBlackListed) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: SUCCESS_STATUS.FAILURE,
        message: ERROR_MESSAGES.SESSION_EXPIRED,
      });
      return;
    }

    req.user = decode;

    const userRepository = container.resolve<IUserRepository>(REPOSITORY_TOKENS.USER_REPOSITORY);
    const user = await userRepository.findOne({ email: req.user.email });
    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: SUCCESS_STATUS.FAILURE,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
      return;
    }

    if (user.isBlocked) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: SUCCESS_STATUS.FAILURE,
        message: ERROR_MESSAGES.ACCOUNT_BLOCKED,
      });
      return;
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: SUCCESS_STATUS.FAILURE,
      message: ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR,
    });
  }
};
