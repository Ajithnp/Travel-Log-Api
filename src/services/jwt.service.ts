import jwt from 'jsonwebtoken';
import { ITokenPayload, ITokenService } from 'interfaces/service_interfaces/ITokenService';
import { config } from '../config/env';
import { injectable } from 'tsyringe';
import { JWT_TOKEN } from '../shared/constants/jwt.token';


@injectable()
export class TokenService implements ITokenService {
  private _accessSecret: string;
  private _refreshSecret: string;

  constructor() {
    this._accessSecret = config.jwt.ACCESS_TOKEN_SECRET;
    this._refreshSecret = config.jwt.REFRESH_TOKEN_SECRET;
  }

  generateAccessToken(payload: ITokenPayload): string {
    return jwt.sign(payload, this._accessSecret, { expiresIn: JWT_TOKEN.ACCESS_TOKEN_EXPIRY });
  }

  generateRefreshToken(payload: ITokenPayload): string {
    return jwt.sign(payload, this._refreshSecret, { expiresIn: JWT_TOKEN.REFRESH_TOKEN_EXPIRY });
  }

  verifyAccessToken(token: string): ITokenPayload | null {
    try {
      const decoded = jwt.verify(token, this._accessSecret);

      if (!decoded || typeof decoded === 'string') return null;

      return decoded as ITokenPayload;
    } catch (error) {
      return null;
    }
  }

  verifyRefreshToken(token: string): ITokenPayload | null{
    try {
      const decoded = jwt.verify(token, this._refreshSecret);

      if (!decoded || typeof decoded === 'string') return null;

      return decoded as ITokenPayload;
    } catch (error) {
      return null;
    }
  }

  decodeToken(token: string): ITokenPayload | null {
    try {
      const decodedToken = jwt.decode(token);

      if (!decodedToken || typeof decodedToken === 'string') return null;
      return decodedToken as ITokenPayload;
    } catch (error) {
      return null;
    };
  };
}
