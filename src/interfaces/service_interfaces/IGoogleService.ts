import { IGoogleUser } from "../../types/IGoogleUserInfo";

export interface IGoogleService {
    
    getUserInfoFromAccessToken(accessToken: string, clientId: string): Promise<IGoogleUser>;
}