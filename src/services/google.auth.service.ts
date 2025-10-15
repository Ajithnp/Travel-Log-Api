import { injectable } from 'tsyringe';
import { IGoogleUser } from 'types/IGoogleUser';
import { IGoogleService } from 'interfaces/service_interfaces/IGoogleService';
import { OAuth2Client } from 'google-auth-library';
import { AppError } from '../errors/AppError';
import { HTTP_STATUS } from '../shared/constants/http_status_code';

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
        throw new AppError('Invalid token', HTTP_STATUS.BAD_REQUEST);
      }

      const response = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };

      return response;
    } catch (error) {
      throw new AppError('Failed to verify Google token', HTTP_STATUS.UNAUTHORIZED);
    }
  }
}
