// socket/middleware/socket.auth.middleware.ts

import { Socket } from 'socket.io';
import { container } from 'tsyringe';
import { ITokenService } from '../../interfaces/service_interfaces/ITokenService';
import { ITokenBlackListService } from '../../interfaces/service_interfaces/ITokenBlacklistService';
import { IUserRepository } from '../../interfaces/repository_interfaces/IUserRepository';
import { SERVICE_TOKENS, REPOSITORY_TOKENS } from '../../shared/constants/di.tokens';
import { JWT_TOKEN } from '../../shared/constants/jwt.token';
import { SocketData } from './types/socket.types';
import logger from '../../config/logger';
import { parseCookies } from '../../shared/utils/cookie.parse.helper';
type AppSocket = Socket<SocketData>;



export const socketAuthMiddleware = async (
  socket: AppSocket,
  next: (err?: Error) => void,
): Promise<void> => {
  try {
    const cookieHeader = socket.handshake.headers?.cookie;

    if (!cookieHeader) {
      return next(new Error('AUTH_ERROR: No cookies found'));
    }

    const cookies = parseCookies(cookieHeader);
    const token = cookies[JWT_TOKEN.ACCESS_TOKEN];

    if (!token) {
      return next(new Error('AUTH_ERROR: Access token missing'));
    }

   
    const tokenService = container.resolve<ITokenService>(SERVICE_TOKENS.TOKEN_SERVICE);
    const decoded = tokenService.verifyAccessToken(token);

    if (!decoded) {
      return next(new Error('AUTH_ERROR: Invalid token'));
    }

    
    const tokenBlackListService = container.resolve<ITokenBlackListService>(
      SERVICE_TOKENS.TOKEN_BLACKLIST,
    );
    const isBlackListed = await tokenBlackListService.isBlackListed(token);

    if (isBlackListed) {
      return next(new Error('AUTH_ERROR: Session expired'));
    }

   
    const userRepository = container.resolve<IUserRepository>(
      REPOSITORY_TOKENS.USER_REPOSITORY,
    );
    const user = await userRepository.findOne({ email: decoded.email });

    if (!user) {
      return next(new Error('AUTH_ERROR: User not found'));
    }

    if (user.isBlocked) {
      return next(new Error('AUTH_ERROR: Account is blocked'));
    }

   
    socket.data.userId = decoded.userId;  
    socket.data.role = decoded.role;

    logger.info(`[Socket Auth] Authenticated: userId=${socket.data.userId} role=${socket.data.role}`);

    next(); // allow connection

  } catch (error) {
    logger.error('[Socket Auth] Middleware error', error);
    next(new Error('AUTH_ERROR: Unexpected error during authentication'));
  }
};