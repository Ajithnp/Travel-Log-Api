import { injectable } from 'tsyringe';
import { IGoogleUser } from 'types/IGoogleUserInfo';
import { IGoogleService } from 'interfaces/service_interfaces/IGoogleService';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/env';

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
        throw new Error('Invalid token: no payload found');
      }

      return {
        googleId: payload.sub,
        email:payload.email,
        name: payload.name,
        picture: payload.picture
      };

    } catch (error) {
      console.error('error');
       throw new Error("Failed to verify Google token.");
    }
  }
}
