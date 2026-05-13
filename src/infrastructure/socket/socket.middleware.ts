import { ExtendedError } from "socket.io";
import { container } from 'tsyringe';
import { ITokenService } from '../../interfaces/service_interfaces/ITokenService';
import { ITokenBlackListService } from '../../interfaces/service_interfaces/ITokenBlacklistService';
import { IUserRepository } from '../../interfaces/repository_interfaces/IUserRepository';
import { SERVICE_TOKENS, REPOSITORY_TOKENS } from '../../shared/constants/di.tokens';
import { JWT_TOKEN } from '../../shared/constants/jwt.token';
import { AuthenticatedSocket } from './types/socket.types';
import logger from '../../config/logger';
import {parse} from "cookie";

type AppSocket = AuthenticatedSocket;

export const socketAuthMiddleware = async (
  socket: AppSocket,
  next: (err?: ExtendedError) => void,
): Promise<void> => {
  try {
    const rawCookies = socket.handshake.headers?.cookie ?? "";
    const parsedCookies = parse(rawCookies);
    const token: string | undefined =
      parsedCookies[JWT_TOKEN.ACCESS_TOKEN] ||
      socket.handshake.auth?.[JWT_TOKEN.ACCESS_TOKEN]

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

    const userRepository = container.resolve<IUserRepository>(REPOSITORY_TOKENS.USER_REPOSITORY);
    const user = await userRepository.findOne({ email: decoded.email });

    if (!user) {
      return next(new Error('AUTH_ERROR: User not found'));
    }

    if (user.isBlocked) {
      return next(new Error('AUTH_ERROR: Account is blocked'));
    }

    socket.data.userId = decoded.userId ?? user._id.toString();
    socket.data.role   = decoded.role;

    logger.info(
      `[Socket Auth] Authenticated: userId=${socket.data.userId} role=${socket.data.role}`,
    );

    next(); // allow connection
  } catch (error) {
    logger.error('[Socket Auth] Middleware error', error);
    next(new Error('AUTH_ERROR: Unexpected error during authentication'));
  }
};
