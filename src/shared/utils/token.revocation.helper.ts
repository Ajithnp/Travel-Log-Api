import redisClient from "../../config/redis.config";
import { smallHasher } from "./small.hasher.helper";
import { container } from "tsyringe";
import { ITokenService } from "../../interfaces/service_interfaces/ITokenService";

export const blacklistToken = async (token: string) => {
     const tokenService = container.resolve<ITokenService>("ITokenService");

     const decodedToken = tokenService.decodeToken(token);

     if(!decodedToken || !decodedToken.exp){
        return;
     };

     const exp = decodedToken.exp * 1000;
     const now = Date.now();
     const ttl = Math.floor((exp - now) / 1000);

     if(ttl <= 0) return;
     const tokenHash = smallHasher(token);
     await redisClient.set(`bl_token${tokenHash}`, 'true', {EX:ttl});
    
};


