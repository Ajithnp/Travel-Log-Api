import { ICacheService } from 'interfaces/service_interfaces/ICacheService';
import { inject, injectable } from 'tsyringe';
import redisClient from '../config/redis.config';

@injectable()
export class CacheService implements ICacheService {
  private readonly _redisClient = redisClient;

  async get<T>(key: string): Promise<T | null> {
    const data = await this._redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 60): Promise<void> {
    await this._redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this._redisClient.del(key);
  }

  async clearPrefix(prefix: string): Promise<void> {
    const keys = await this._redisClient.keys(`${prefix}*`);
    if (keys.length) {
      await this._redisClient.del(keys);
    }
  }
}
