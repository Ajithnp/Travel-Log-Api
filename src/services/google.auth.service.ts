import { injectable } from 'tsyringe';
import { IGoogleUser } from '../types/IGoogleUser';
import { IGoogleService } from '../interfaces/service_interfaces/IGoogleService';
import { OAuth2Client } from 'google-auth-library';
import { AppError } from '../errors/AppError';
import { HTTP_STATUS } from '../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../shared/constants/messages';

@injectable()
export class GoogleService implements IGoogleService {
  private _client: OAuth2Client;

  constructor() {
    this._client = new OAuth2Client();
  }

  async getUserInfoFromAccessToken(accessToken: string, clientId: string): Promise<IGoogleUser> {
    try {
      const ticket = await this._client.verifyIdToken({
        idToken: accessToken,
        audience: clientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.BAD_REQUEST);
      }

      const response = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };

      return response;
    } catch {
      throw new AppError(ERROR_MESSAGES.FAILED_TO_VERIFY_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    }
  }
}
