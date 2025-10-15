import { IGoogleUser } from '../../types/IGoogleUser';

export interface IGoogleService {
  getUserInfoFromAccessToken(accessToken: string, clientId: string): Promise<IGoogleUser>;
}
