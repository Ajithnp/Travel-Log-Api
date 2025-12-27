import { inject, injectable } from 'tsyringe';
import { ITokenBlackListService } from '../interfaces/service_interfaces/ITokenBlacklistService';
import { ICacheService } from '../interfaces/service_interfaces/ICacheService';
import { smallHasher } from '../shared/utils/small.hasher.helper';
@injectable()
export class TokenBlackListService implements ITokenBlackListService {
  constructor(
    @inject('ICacheService')
    private _cacheService: ICacheService,
  ) {}

  async blackListToken(token: string, tokenExp: string) {
    const ttl = Number(tokenExp) - Math.floor(Date.now() / 1000);
    if (ttl <= 0) return; // prevent storing expired token;

    const tokenHash = smallHasher(token); // Don't store raw token in redis;

    await this._cacheService.set(`bl_token:${tokenHash}`, 'true', ttl);
  }

  async isBlackListed(token: string): Promise<boolean> {
    const tokenHash = smallHasher(token);
    const exists = await this._cacheService.exists(`bl_token:${tokenHash}`);
    return exists === 1;
  }
}
